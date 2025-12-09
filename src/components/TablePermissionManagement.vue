<template>
  <div class="bg-white rounded-xl shadow">
    <div class="border-b border-gray-200 p-6">
      <h2 class="text-xl font-bold text-gray-900">表格访问权限管理</h2>
      <p class="text-sm text-gray-600 mt-1">管理员工对各个表格的访问权限和权限请求</p>
    </div>

    <div class="flex">
      <!-- 左侧：表格列表 -->
      <div class="w-1/3 border-r border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">表格列表</h3>
        <div class="space-y-2">
          <button v-for="table in tables" :key="table.id"
            @click="selectedTableId = table.id"
            :class="['w-full text-left p-3 rounded-lg transition', 
              selectedTableId === table.id 
                ? 'bg-indigo-50 border border-indigo-600' 
                : 'border border-gray-200 hover:border-gray-300']">
            <div class="font-medium text-gray-900">{{ table.name }}</div>
            <div class="text-xs text-gray-600 mt-1">{{ table.accessCount }} 人有权限</div>
          </button>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="font-semibold text-gray-900 mb-3">待处理权限申请</h3>
          <div class="space-y-2">
            <div v-for="req in pendingRequests" :key="req.id"
              @click="selectRequest(req.id)"
              :class="['p-3 rounded-lg border cursor-pointer transition',
                selectedRequestId === req.id ? 'border-orange-600 bg-orange-50' : 'border-gray-200 hover:border-orange-400']">
              <div class="flex items-start justify-between">
                <div>
                  <div class="font-medium text-gray-900 text-sm">{{ req.applicant }}</div>
                  <div class="text-xs text-gray-600">申请: {{ req.tableName }}</div>
                </div>
                <span class="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs font-medium">新</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：表格详情和权限管理 -->
      <div v-if="selectedTable" class="flex-1 p-6 space-y-6">
        <!-- 表格基本信息 -->
        <div>
          <h3 class="font-semibold text-gray-900 mb-3">表格信息</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">表格名称</label>
              <p class="text-gray-900">{{ selectedTable.name }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">拥有者</label>
              <p class="text-gray-900">{{ selectedTable.owner }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">列数</label>
              <p class="text-gray-900">{{ selectedTable.columns.length }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">当前访问者</label>
              <p class="text-gray-900">{{ selectedTable.accessors.length }} 人</p>
            </div>
          </div>
        </div>

        <!-- 列权限配置 -->
        <div>
          <h3 class="font-semibold text-gray-900 mb-3">列属性管理</h3>
          <div class="space-y-2">
            <div v-for="col in selectedTable.columns" :key="col.id" class="p-3 border border-gray-200 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900 text-sm">{{ col.name }}</p>
                  <p class="text-xs text-gray-600">类型: {{ col.type }}</p>
                </div>
                <button @click="editColumn(col)" 
                  class="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">编辑</button>
              </div>
            </div>
          </div>
          <button @click="showAddColumnModal = true"
            class="mt-3 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 w-full flex items-center justify-center">
            <iconify-icon icon="mdi:plus" class="mr-1"></iconify-icon>
            添加新列
          </button>
        </div>

        <!-- 访问权限用户 -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-gray-900">访问权限用户</h3>
            <button class="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">
              <iconify-icon icon="mdi:plus" class="mr-1"></iconify-icon>
              添加用户
            </button>
          </div>
          <div class="space-y-2">
            <div v-for="accessor in selectedTable.accessors" :key="accessor.id" 
              class="p-3 border border-gray-200 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <p class="font-medium text-gray-900 text-sm">{{ accessor.name }}</p>
                    <p class="text-xs text-gray-600">{{ accessor.department }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <select :value="accessor.permission" @change="(e) => updateAccessor(accessor.id, e.target.value)"
                    class="px-2 py-1 border border-gray-300 rounded text-xs">
                    <option value="view">只读</option>
                    <option value="edit">编辑</option>
                    <option value="admin">管理</option>
                  </select>
                  <button @click="removeAccessor(accessor.id)"
                    class="px-2 py-1 text-xs text-red-600 hover:text-red-800">移除</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PR列表 -->
        <div>
          <h3 class="font-semibold text-gray-900 mb-3">开放的Pull Requests</h3>
          <div class="space-y-2">
            <div v-for="pr in selectedTable.pullRequests" :key="pr.id"
              class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="font-medium text-gray-900 text-sm">PR #{{ pr.number }}: {{ pr.title }}</p>
                  <p class="text-xs text-gray-600 mt-1">由 {{ pr.author }} 在 {{ pr.createdAt }}</p>
                  <div class="flex space-x-2 mt-2">
                    <span v-for="change in pr.changes" :key="change" class="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                      {{ change }}
                    </span>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button @click="approvePR(pr.id)"
                    class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">合并</button>
                  <button @click="rejectPR(pr.id)"
                    class="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50">拒绝</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 权限申请处理 -->
      <div v-else-if="selectedRequest" class="flex-1 p-6">
        <div class="mb-6 pb-6 border-b border-gray-200">
          <h3 class="font-semibold text-gray-900 mb-3">权限申请详情</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">申请人</label>
              <p class="text-gray-900">{{ selectedRequest.applicant }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">申请表格</label>
              <p class="text-gray-900">{{ selectedRequest.tableName }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">申请权限类型</label>
              <p class="text-gray-900">{{ selectedRequest.type === 'view' ? '只读' : '编辑' }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">申请的列</label>
              <div class="flex flex-wrap gap-2">
                <span v-for="col in selectedRequest.columns" :key="col"
                  class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {{ col }}
                </span>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">申请原因</label>
              <p class="text-gray-700 text-sm">{{ selectedRequest.reason }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">申请时间</label>
              <p class="text-gray-600 text-sm">{{ selectedRequest.timestamp }}</p>
            </div>
          </div>
        </div>

        <!-- 审批意见 -->
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">审批意见</label>
            <textarea v-model="approvalComment"
              placeholder="输入审批意见..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          <div class="flex gap-3">
            <button @click="approveRequest"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
              <iconify-icon icon="mdi:check" class="mr-1"></iconify-icon>
              批准
            </button>
            <button @click="rejectRequest"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">
              <iconify-icon icon="mdi:close" class="mr-1"></iconify-icon>
              拒绝
            </button>
          </div>
        </div>
      </div>

      <div v-else class="flex-1 flex items-center justify-center text-gray-500">
        <p>请选择一个表格或权限申请</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const selectedTableId = ref(1)
const selectedRequestId = ref(null)
const showAddColumnModal = ref(false)
const approvalComment = ref('')

const tables = ref([
  {
    id: 1,
    name: '项目信息表',
    owner: '张工',
    columns: [
      { id: 1, name: '项目ID', type: 'text' },
      { id: 2, name: '项目名称', type: 'text' },
      { id: 3, name: '负责人', type: 'text' },
      { id: 4, name: '状态', type: 'select' },
      { id: 5, name: '预算', type: 'number' }
    ],
    accessors: [
      { id: 1, name: '张工', department: '技术部', permission: 'admin' },
      { id: 2, name: '李技术', department: '技术部', permission: 'edit' },
      { id: 3, name: '王经理', department: '项目部', permission: 'view' }
    ],
    accessCount: 3,
    pullRequests: [
      {
        id: 1,
        number: 12,
        title: '添加预算支出列',
        author: '李技术',
        createdAt: '2025-12-08 14:30',
        changes: ['新增列', '数据更新']
      }
    ]
  },
  {
    id: 2,
    name: '员工绩效表',
    owner: '王经理',
    columns: [
      { id: 1, name: '员工ID', type: 'text' },
      { id: 2, name: '员工名称', type: 'text' },
      { id: 3, name: '部门', type: 'text' },
      { id: 4, name: '绩效评分', type: 'number' }
    ],
    accessors: [
      { id: 4, name: '王经理', department: '项目部', permission: 'admin' },
      { id: 5, name: '张工', department: '技术部', permission: 'view' }
    ],
    accessCount: 2,
    pullRequests: []
  },
  {
    id: 3,
    name: '财务预算表',
    owner: '李财务',
    columns: [
      { id: 1, name: '部门', type: 'text' },
      { id: 2, name: '预算总额', type: 'number' },
      { id: 3, name: '已支出', type: 'number' }
    ],
    accessors: [
      { id: 6, name: '李财务', department: '财务部', permission: 'admin' }
    ],
    accessCount: 1,
    pullRequests: []
  }
])

const pendingRequests = ref([
  {
    id: 1,
    applicant: '李技术',
    tableName: '财务预算表',
    type: 'view',
    columns: ['部门', '预算总额', '已支出'],
    reason: '需要查看财务预算信息以完成项目成本分析',
    timestamp: '2025-12-08 10:30'
  },
  {
    id: 2,
    applicant: '王经理',
    tableName: '项目信息表',
    type: 'edit',
    columns: ['状态', '预期完成时间'],
    reason: '需要更新项目状态和时间信息',
    timestamp: '2025-12-08 09:15'
  }
])

const selectedTable = computed(() => tables.value.find(t => t.id === selectedTableId.value))
const selectedRequest = computed(() => pendingRequests.value.find(r => r.id === selectedRequestId.value))

function selectRequest(id) {
  selectedRequestId.value = id
  selectedTableId.value = null
}

function updateAccessor(id, permission) {
  const accessor = selectedTable.value?.accessors.find(a => a.id === id)
  if (accessor) {
    accessor.permission = permission
  }
}

function removeAccessor(id) {
  if (selectedTable.value) {
    selectedTable.value.accessors = selectedTable.value.accessors.filter(a => a.id !== id)
  }
}

function editColumn(col) {
  alert(`编辑列: ${col.name}`)
}

function approvePR(prId) {
  if (selectedTable.value) {
    selectedTable.value.pullRequests = selectedTable.value.pullRequests.filter(pr => pr.id !== prId)
    alert('PR已合并')
  }
}

function rejectPR(prId) {
  if (selectedTable.value) {
    selectedTable.value.pullRequests = selectedTable.value.pullRequests.filter(pr => pr.id !== prId)
    alert('PR已拒绝')
  }
}

function approveRequest() {
  if (!approvalComment.value) {
    alert('请输入审批意见')
    return
  }
  alert(`已批准 ${selectedRequest.value.applicant} 的权限申请`)
  pendingRequests.value = pendingRequests.value.filter(r => r.id !== selectedRequestId.value)
  selectedRequestId.value = null
  approvalComment.value = ''
}

function rejectRequest() {
  if (!approvalComment.value) {
    alert('请输入拒绝原因')
    return
  }
  alert(`已拒绝 ${selectedRequest.value.applicant} 的权限申请`)
  pendingRequests.value = pendingRequests.value.filter(r => r.id !== selectedRequestId.value)
  selectedRequestId.value = null
  approvalComment.value = ''
}
</script>
