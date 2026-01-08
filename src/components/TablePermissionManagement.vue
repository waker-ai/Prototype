<template>
  <div class="bg-white rounded-none border-4 border-black shadow-neo animate-fade-in-up">
    <div class="border-b-4 border-black p-6 bg-neo-yellow">
      <h2 class="text-2xl font-black text-black uppercase tracking-tight">表格访问权限管理</h2>
      <p class="text-sm font-bold text-black mt-1 bg-white inline-block px-2 border-2 border-black">管理员工对各个表格的访问权限和权限请求</p>
    </div>

    <div class="flex">
      <!-- 左侧：表格列表 -->
      <div class="w-1/3 border-r-4 border-black p-6 bg-neo-white">
        <h3 class="font-black text-xl text-black uppercase mb-4 border-b-4 border-black inline-block">表格列表</h3>
        <div class="space-y-4">
          <button v-for="table in tables" :key="table.id"
            @click="selectedTableId = table.id"
            :class="['w-full text-left p-4 rounded-none transition-all border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-neo', 
              selectedTableId === table.id 
                ? 'bg-neo-blue border-black text-white' 
                : 'bg-white border-black text-black hover:bg-gray-50']">
            <div class="font-black text-lg uppercase">{{ table.name }}</div>
            <div class="text-xs font-bold mt-1 uppercase" :class="selectedTableId === table.id ? 'text-white' : 'text-gray-600'">{{ table.accessCount }} 人有权限</div>
          </button>
        </div>

        <div class="mt-8 pt-6 border-t-4 border-black">
          <h3 class="font-black text-xl text-black uppercase mb-4 border-b-4 border-black inline-block">待处理权限申请</h3>
          <div class="space-y-4">
            <div v-for="req in pendingRequests" :key="req.id"
              @click="selectRequest(req.id)"
              :class="['p-4 border-4 cursor-pointer transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-neo',
                selectedRequestId === req.id ? 'border-black bg-neo-pink text-black' : 'border-black bg-white hover:bg-orange-50']">
              <div class="flex items-start justify-between">
                <div>
                  <div class="font-black uppercase text-sm">{{ req.applicant }}</div>
                  <div class="text-xs font-bold mt-1 uppercase">申请: {{ req.tableName }}</div>
                </div>
                <span class="px-2 py-1 bg-neo-yellow text-black border-2 border-black text-xs font-black uppercase shadow-neo-sm">新</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：表格详情和权限管理 -->
      <div v-if="selectedTable" class="flex-1 p-8 space-y-8 bg-white">
        <!-- 表格基本信息 -->
        <div class="border-4 border-black p-6 shadow-neo bg-white">
          <h3 class="font-black text-xl text-black uppercase mb-4 border-b-4 border-black pb-2 inline-block">表格信息</h3>
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-black text-black uppercase mb-1 bg-neo-lime inline-block px-1 border-2 border-black">表格名称</label>
              <p class="text-black font-bold text-lg border-b-2 border-black">{{ selectedTable.name }}</p>
            </div>
            <div>
              <label class="block text-xs font-black text-black uppercase mb-1 bg-neo-lime inline-block px-1 border-2 border-black">拥有者</label>
              <p class="text-black font-bold text-lg border-b-2 border-black">{{ selectedTable.owner }}</p>
            </div>
            <div>
              <label class="block text-xs font-black text-black uppercase mb-1 bg-neo-lime inline-block px-1 border-2 border-black">列数</label>
              <p class="text-black font-bold text-lg border-b-2 border-black">{{ selectedTable.columns.length }}</p>
            </div>
            <div>
              <label class="block text-xs font-black text-black uppercase mb-1 bg-neo-lime inline-block px-1 border-2 border-black">当前访问者</label>
              <p class="text-black font-bold text-lg border-b-2 border-black">{{ selectedTable.accessors.length }} 人</p>
            </div>
          </div>
        </div>

        <!-- 列权限配置 -->
        <div class="border-4 border-black p-6 shadow-neo bg-white">
          <h3 class="font-black text-xl text-black uppercase mb-4 border-b-4 border-black pb-2 inline-block">列属性管理</h3>
          <div class="space-y-4">
            <div v-for="col in selectedTable.columns" :key="col.id" class="p-4 border-4 border-black bg-neo-white flex items-center justify-between hover:shadow-neo-sm transition-shadow">
              <div>
                <p class="font-black text-black uppercase">{{ col.name }}</p>
                <p class="text-xs font-bold text-gray-700 bg-white border-2 border-black px-1 inline-block mt-1">TYPE: {{ col.type }}</p>
              </div>
              <button @click="editColumn(col)" 
                class="neo-btn px-3 py-1 text-xs bg-white hover:bg-gray-100 border-2 border-black font-black uppercase shadow-neo-sm">EDIT</button>
            </div>
          </div>
          <button @click="showAddColumnModal = true"
            class="mt-4 px-4 py-3 border-4 border-dashed border-black bg-gray-50 text-sm font-black text-black uppercase hover:bg-gray-100 hover:border-solid w-full flex items-center justify-center transition-all">
            <iconify-icon icon="mdi:plus" class="mr-2 text-xl"></iconify-icon>
            添加新列
          </button>
        </div>

        <!-- 访问权限用户 -->
        <div class="border-4 border-black p-6 shadow-neo bg-white">
          <div class="flex items-center justify-between mb-4 border-b-4 border-black pb-2">
            <h3 class="font-black text-xl text-black uppercase">访问权限用户</h3>
            <button class="neo-btn px-3 py-2 text-sm bg-black text-white hover:bg-gray-800 flex items-center uppercase">
              <iconify-icon icon="mdi:plus" class="mr-1"></iconify-icon>
              ADD USER
            </button>
          </div>
          <div class="space-y-4">
            <div v-for="accessor in selectedTable.accessors" :key="accessor.id" 
              class="p-4 border-4 border-black bg-white hover:shadow-neo-sm transition-shadow">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 bg-neo-blue border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                    <iconify-icon icon="mdi:account" class="text-white text-xl"></iconify-icon>
                  </div>
                  <div>
                    <p class="font-black text-black uppercase">{{ accessor.name }}</p>
                    <p class="text-xs font-bold text-black border-2 border-black px-1 mt-1 bg-neo-yellow inline-block">{{ accessor.department }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-3">
                  <select :value="accessor.permission" @change="(e) => updateAccessor(accessor.id, e.target.value)"
                    class="neo-input px-2 py-1 bg-white border-2 border-black font-bold uppercase cursor-pointer text-xs">
                    <option value="view">只读</option>
                    <option value="edit">编辑</option>
                    <option value="admin">管理</option>
                  </select>
                  <button @click="removeAccessor(accessor.id)"
                    class="neo-btn px-2 py-1 text-xs bg-neo-pink text-black border-2 border-black hover:shadow-neo-sm uppercase font-black">移除</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PR列表 -->
        <div class="border-4 border-black p-6 shadow-neo bg-white">
          <h3 class="font-black text-xl text-black uppercase mb-4 border-b-4 border-black pb-2 inline-block">开放的Pull Requests</h3>
          <div class="space-y-4">
            <div v-for="pr in selectedTable.pullRequests" :key="pr.id"
              class="p-4 border-4 border-black bg-neo-white hover:bg-white cursor-pointer hover:shadow-neo transition-all">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="font-black text-black uppercase flex items-center">
                    <span class="bg-black text-white px-2 py-0.5 mr-2 text-xs">#{{ pr.number }}</span>
                    {{ pr.title }}
                  </p>
                  <p class="text-xs font-bold text-gray-600 mt-2 border-l-4 border-black pl-2">Created by {{ pr.author }} on {{ pr.createdAt }}</p>
                  <div class="flex space-x-2 mt-3">
                    <span v-for="change in pr.changes" :key="change" class="px-2 py-1 bg-neo-blue text-white border-2 border-black text-xs font-black uppercase shadow-neo-sm">
                      {{ change }}
                    </span>
                  </div>
                </div>
                <div class="flex space-x-3">
                  <button @click="approvePR(pr.id)"
                    class="neo-btn px-3 py-1 text-xs bg-neo-lime text-black border-2 border-black hover:bg-green-400 uppercase font-black">合并</button>
                  <button @click="rejectPR(pr.id)"
                    class="neo-btn px-3 py-1 text-xs bg-white text-black border-2 border-black hover:bg-gray-100 uppercase font-black">拒绝</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 权限申请处理 -->
      <div v-else-if="selectedRequest" class="flex-1 p-8 bg-white">
        <div class="mb-8 pb-6 border-b-4 border-black">
          <h3 class="font-black text-2xl text-black uppercase mb-6 bg-neo-pink inline-block px-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">权限申请详情</h3>
          <div class="space-y-6 border-4 border-black p-6 shadow-neo bg-white">
            <div>
              <label class="block text-xs font-black text-black uppercase mb-1 bg-neo-yellow inline-block px-1 border-2 border-black">申请人</label>
              <p class="text-black font-bold text-lg border-b-2 border-black mt-1">{{ selectedRequest.applicant }}</p>
            </div>
            <div>
              <label class="block text-xs font-black text-black uppercase mb-1 bg-neo-yellow inline-block px-1 border-2 border-black">申请表格</label>
              <p class="text-black font-bold text-lg border-b-2 border-black mt-1">{{ selectedRequest.tableName }}</p>
            </div>
            <div>
              <label class="block text-xs font-black text-black uppercase mb-1 bg-neo-yellow inline-block px-1 border-2 border-black">申请权限类型</label>
              <p class="text-black font-bold text-lg border-b-2 border-black mt-1 uppercase">{{ selectedRequest.type === 'view' ? '只读' : '编辑' }}</p>
            </div>
            <div>
              <label class="block text-xs font-black text-black uppercase mb-2 bg-neo-yellow inline-block px-1 border-2 border-black">申请的列</label>
              <div class="flex flex-wrap gap-2">
                <span v-for="col in selectedRequest.columns" :key="col"
                  class="px-2 py-1 bg-white border-2 border-black text-black font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs">
                  {{ col }}
                </span>
              </div>
            </div>
            <div>
              <label class="block text-xs font-black text-black uppercase mb-1 bg-neo-yellow inline-block px-1 border-2 border-black">申请原因</label>
              <p class="text-black font-bold text-sm border-l-4 border-black pl-2 mt-1 bg-neo-white p-2">{{ selectedRequest.reason }}</p>
            </div>
            <div>
              <label class="block text-xs font-black text-black uppercase mb-1 bg-neo-yellow inline-block px-1 border-2 border-black">申请时间</label>
              <p class="text-gray-600 font-bold text-sm bg-white p-1">{{ selectedRequest.timestamp }}</p>
            </div>
          </div>
        </div>

        <!-- 审批意见 -->
        <div class="space-y-4 border-4 border-black p-6 shadow-neo bg-neo-white">
          <div>
            <label class="block text-sm font-black text-black uppercase mb-2">审批意见</label>
            <textarea v-model="approvalComment"
              placeholder="YOUR COMMENT..."
              class="neo-input w-full px-3 py-2 bg-white text-black font-bold uppercase border-2 border-black"></textarea>
          </div>

          <div class="flex gap-4">
            <button @click="approveRequest"
              class="neo-btn flex-1 px-4 py-3 bg-neo-lime text-black border-2 border-black hover:shadow-neo font-black text-sm uppercase flex justify-center items-center">
              <iconify-icon icon="mdi:check" class="mr-2 text-xl"></iconify-icon>
              批准
            </button>
            <button @click="rejectRequest"
              class="neo-btn flex-1 px-4 py-3 bg-neo-pink text-black border-2 border-black hover:shadow-neo font-black text-sm uppercase flex justify-center items-center">
              <iconify-icon icon="mdi:close" class="mr-2 text-xl"></iconify-icon>
              拒绝
            </button>
          </div>
        </div>
      </div>

      <div v-else class="flex-1 flex items-center justify-center text-black font-black uppercase text-xl bg-neo-white border-l-4 border-black">
        <div class="text-center">
          <iconify-icon icon="mdi:arrow-left" class="text-6xl mb-4"></iconify-icon>
          <p>请选择一个表格或权限申请</p>
        </div>
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
