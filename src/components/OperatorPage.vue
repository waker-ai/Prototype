<template>
  <div class="bg-gray-50 min-h-screen font-sans">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-10 bg-white shadow-sm h-20 flex items-center px-8">
      <div class="flex items-center space-x-3">
        <iconify-icon class="text-indigo-700 text-2xl" icon="material-symbols:rocket-launch"></iconify-icon>
        <h1 class="text-2xl font-bold text-gray-900">项目变更SOP清单</h1>
      </div>
      <div class="ml-auto flex items-center space-x-6">
        <div class="relative">
          <input
            v-model="searchQuery"
            class="w-64 px-4 py-2 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            placeholder="搜索变更项目..." type="text" />
          <iconify-icon class="absolute right-3 top-2.5 text-gray-500 text-xl" icon="mdi:magnify"></iconify-icon>
        </div>
        <button class="flex items-center text-indigo-600 hover:text-indigo-800" @click="openSyncChangesModal">
          <iconify-icon class="mr-1 text-xl" icon="mdi:cloud-sync-outline"></iconify-icon>
          同步变更窗口
        </button>
        <div class="flex items-center space-x-2 py-1">
          <div class="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10"></div>
          <span class="font-medium text-gray-700">操作者</span>
        </div>
        <router-link to="/admin" class="text-indigo-600 hover:text-indigo-800 ml-4">
          管理员视图
        </router-link>
      </div>
    </header>

    <div class="flex p-6">
      <!-- 左侧筛选面板 -->
      <aside class="w-72 bg-white rounded-xl shadow p-5 mr-6 h-fit sticky top-24">
        <h2 class="font-semibold text-gray-800 mb-4">筛选条件</h2>
        
        <!-- SOP分类 -->
        <div class="mb-5">
          <h3 class="text-sm font-medium text-gray-700 mb-2">SOP分类</h3>
          <div class="space-y-1">
            <label v-for="category in categories" :key="category" class="flex items-center">
              <input class="mr-2 h-4 w-4 accent-indigo-600" type="checkbox" />
              <span class="text-gray-600">{{ category }}</span>
            </label>
          </div>
        </div>

        <!-- 状态过滤 -->
        <div class="mb-5">
          <h3 class="text-sm font-medium text-gray-700 mb-2">状态过滤</h3>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="status in statuses" :key="status.name"
              :class="['py-1 px-3 rounded-md text-sm', status.class]">
              {{ status.name }}
            </button>
          </div>
        </div>

        <!-- 优先级 -->
        <div class="mb-5">
          <h3 class="text-sm font-medium text-gray-700 mb-2">优先级</h3>
          <div class="space-y-1">
            <label v-for="(priority, index) in priorities" :key="priority" class="flex items-center">
              <input class="mr-2 h-4 w-4 accent-indigo-600" type="radio" name="priority" 
                :checked="index === 1" />
              <span class="text-gray-600">{{ priority }}</span>
            </label>
          </div>
        </div>

        <!-- 时间范围 -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-2">时间范围</h3>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-1.5 bg-gray-50 rounded-lg border border-gray-200">
            <div class="flex-1 min-w-[100px]">
              <input
                class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                type="date" />
            </div>
            <span class="text-gray-500 text-xs font-medium sm:mx-1 whitespace-nowrap">至</span>
            <div class="flex-1 min-w-[100px]">
              <input
                class="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                type="date" />
            </div>
          </div>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <main class="flex-1">
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div v-for="card in projectCards" :key="card.id" class="bg-white rounded-xl shadow-md overflow-hidden card-transition">
            <div class="flex border-b border-gray-100 p-4">
              <div :class="['w-1 h-full rounded mr-3', card.colorClass]"></div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="bg-indigo-100 text-indigo-700 w-7 h-7 rounded-full flex items-center justify-center mr-2">
                      {{ card.id }}
                    </div>
                    <h3 class="font-medium text-gray-900 hover:text-indigo-700 cursor-pointer" 
                      @click="toggleExpand(card.id)">
                      {{ card.title }}
                    </h3>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button
                      :class="['w-6 h-6 rounded-full border-2 flex items-center justify-center', 
                        card.completed ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300']"
                      @click="toggleStatus(card.id)">
                      <iconify-icon v-if="card.completed" class="text-white" icon="mdi:check"></iconify-icon>
                    </button>
                    <button
                      class="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded flex items-center"
                      @click="openPermissionModal(card.id, card.title, card.description)">
                      <iconify-icon class="mr-1" icon="mdi:upload"></iconify-icon>上传
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="expandedCards.includes(card.id)" class="px-4 py-3 text-gray-600 text-sm card-expand">
              <p>{{ card.description }}</p>
              <div class="mt-4 flex items-center justify-between">
                <span class="text-xs text-gray-500">最后更新: {{ card.updateTime }}</span>
                <span :class="['px-2 py-1 rounded text-xs', card.statusClass]">
                  {{ card.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 同步变更窗口弹窗 -->
    <div v-if="showSyncModal" class="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-xl w-4/5 max-w-5xl p-6 max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900 flex items-center">
            <iconify-icon class="text-indigo-600 mr-2 text-2xl" icon="mdi:cloud-sync"></iconify-icon>
            同步变更窗口
          </h2>
          <button class="text-gray-500 hover:text-gray-700" @click="closeSyncChangesModal">
            <iconify-icon class="text-xl" icon="mdi:close"></iconify-icon>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto max-h-[70vh] border border-gray-200 rounded-lg">
          <table class="w-full text-left">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-6 py-3 font-medium text-gray-500 text-sm border-b">文件名</th>
                <th class="px-6 py-3 font-medium text-gray-500 text-sm border-b">上传者</th>
                <th class="px-6 py-3 font-medium text-gray-500 text-sm border-b">上传时间</th>
                <th class="px-6 py-3 font-medium text-gray-500 text-sm border-b">关联项目</th>
                <th class="px-6 py-3 font-medium text-gray-500 text-sm border-b">文件大小</th>
                <th class="px-6 py-3 font-medium text-gray-500 text-sm border-b">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in changeRecords" :key="record.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 border-b">
                  <div class="flex items-center">
                    <iconify-icon icon="mdi:file-document" class="text-blue-500 text-xl mr-3"></iconify-icon>
                    {{ record.filename }}
                  </div>
                </td>
                <td class="px-6 py-4 border-b">
                  <div class="flex items-center">
                    <div class="bg-gray-200 border-2 border-dashed rounded-full w-7 h-7 mr-2"></div>
                    {{ record.uploader }}
                  </div>
                </td>
                <td class="px-6 py-4 border-b text-gray-600 text-sm">{{ record.uploadTime }}</td>
                <td class="px-6 py-4 border-b">
                  <span class="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">{{ record.project }}</span>
                </td>
                <td class="px-6 py-4 border-b text-gray-500 text-sm">{{ record.size }}</td>
                <td class="px-6 py-4 border-b">
                  <button class="text-indigo-600 hover:text-indigo-800" @click="downloadFile(record.id)">
                    <iconify-icon icon="mdi:download" class="text-lg"></iconify-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-6 flex justify-between items-center">
          <div class="text-sm text-gray-500">
            共 {{ changeRecords.length }} 个变更记录
          </div>
          <div class="flex gap-2">
            <button class="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50">
              导出为报表
            </button>
            <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              清空记录
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 权限申请弹窗 -->
    <div v-if="showPermissionModal" class="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-xl w-96 p-6 border border-gray-200">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-lg text-gray-900">权限申请表</h3>
          <button class="text-gray-500 hover:text-gray-700" @click="closePermissionModal">
            <iconify-icon class="text-xl" icon="mdi:close"></iconify-icon>
          </button>
        </div>
        <div class="space-y-4 max-h-96 overflow-y-auto">
          <!-- 申请人信息 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">申请人</label>
            <div class="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5">
              <p class="text-gray-900">操作者</p>
              <p class="text-xs text-gray-600">技术部</p>
            </div>
          </div>

          <!-- 申请原因 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">申请原因 <span class="text-red-500">*</span></label>
            <textarea
              v-model="permissionForm.reason"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              placeholder="请输入申请原因（至少50字）" rows="3"
              maxlength="500"
              minlength="50"></textarea>
            <p class="text-xs text-gray-500 mt-1">{{ permissionForm.reason.length }}/500 字</p>
          </div>

          <!-- 申请时间 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">申请时间 <span class="text-red-500">*</span></label>
            <input
              v-model="permissionForm.dateTime"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              type="datetime-local" />
          </div>

          <!-- 权限说明 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">权限说明</label>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p class="text-sm text-gray-700">{{ permissionForm.description }}</p>
            </div>
          </div>

          <!-- 状态显示 -->
          <div v-if="permissionForm.submitted" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">申请状态</span>
              <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                等待审批
              </span>
            </div>
            <p class="text-xs text-gray-600">提交时间: {{ new Date().toLocaleString('zh-CN') }}</p>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="flex gap-3 mt-6">
          <button
            class="flex-1 px-4 py-2.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm"
            @click="closePermissionModal">取消</button>
          <button
            class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
            :disabled="permissionForm.submitted"
            @click="submitPermissionRequest">
            {{ permissionForm.submitted ? '已提交' : '提交申请' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const searchQuery = ref('')
const expandedCards = ref([])
const showSyncModal = ref(false)
const showPermissionModal = ref(false)

const categories = ['系统更新', '配置变更', '数据迁移']
const priorities = ['高优先级', '中优先级', '低优先级']
const statuses = [
  { name: '待处理', class: 'bg-yellow-100 text-yellow-800' },
  { name: '进行中', class: 'bg-blue-100 text-blue-800' },
  { name: '已完成', class: 'bg-green-100 text-green-800' },
  { name: '已中止', class: 'bg-red-100 text-red-800' }
]

const projectCards = ref([
  {
    id: 1,
    title: '更新I项目系统',
    description: '更新项目管理系统至最新版本，包括数据库迁移和接口配置',
    colorClass: 'bg-yellow-500',
    status: '待处理',
    statusClass: 'bg-yellow-100 text-yellow-800',
    updateTime: '2025-11-18',
    completed: false
  },
  {
    id: 2,
    title: '更新慧人天系统',
    description: '人力资源系统配置更新，包括员工权限调整和流程优化',
    colorClass: 'bg-blue-500',
    status: '进行中',
    statusClass: 'bg-blue-100 text-blue-800',
    updateTime: '2025-11-20',
    completed: false
  },
  {
    id: 3,
    title: '更新分贝通系统',
    description: '费用管理系统升级，集成新支付接口和审批流程',
    colorClass: 'bg-green-500',
    status: '已完成',
    statusClass: 'bg-green-100 text-green-800',
    updateTime: '2025-11-22',
    completed: true
  },
  {
    id: 4,
    title: '修改企业微信群名与转接群主',
    description: '更新企业微信群名称和负责人，确保组织架构变更同步',
    colorClass: 'bg-yellow-500',
    status: '待处理',
    statusClass: 'bg-yellow-100 text-yellow-800',
    updateTime: '2025-11-23',
    completed: false
  },
  {
    id: 5,
    title: '更新周报总表',
    description: '同步本周项目进展和关键指标到共享周报总表',
    colorClass: 'bg-blue-500',
    status: '进行中',
    statusClass: 'bg-blue-100 text-blue-800',
    updateTime: '2025-11-24',
    completed: false
  },
  {
    id: 6,
    title: '更新财务跟踪总表',
    description: '财务预算与实际支出跟踪更新，整合多部门数据',
    colorClass: 'bg-red-500',
    status: '已中止',
    statusClass: 'bg-red-100 text-red-800',
    updateTime: '2025-11-21',
    completed: false
  }
])

const changeRecords = ref([
  { id: 1, filename: '系统升级方案.pdf', uploader: '张工', uploadTime: '2025-11-23 14:35', project: 'I项目系统', size: '2.4MB' },
  { id: 2, filename: '数据迁移计划.xlsx', uploader: '李技术', uploadTime: '2025-11-22 10:20', project: '分贝通系统', size: '1.2MB' },
  { id: 3, filename: '权限配置更新.doc', uploader: '王经理', uploadTime: '2025-11-21 16:45', project: '慧人天系统', size: '0.8MB' },
  { id: 4, filename: '群主交接确认.png', uploader: '管理员', uploadTime: '2025-11-20 09:15', project: '企业微信群', size: '0.5MB' },
  { id: 5, filename: '周报格式调整.docx', uploader: '助理', uploadTime: '2025-11-19 13:30', project: '周报总表', size: '0.7MB' },
  { id: 6, filename: '财务预算模板.xlsx', uploader: '财务部', uploadTime: '2025-11-18 11:05', project: '财务跟踪表', size: '1.1MB' },
  { id: 7, filename: '变更审核记录.pdf', uploader: '质量组', uploadTime: '2025-11-17 15:40', project: 'I项目系统', size: '1.8MB' }
])

const permissionForm = reactive({
  reason: '',
  dateTime: getCurrentDateTime(),
  description: '',
  submitted: false
})

function getCurrentDateTime() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

function toggleExpand(id) {
  const index = expandedCards.value.indexOf(id)
  if (index === -1) {
    expandedCards.value.push(id)
  } else {
    expandedCards.value.splice(index, 1)
  }
}

function toggleStatus(id) {
  const card = projectCards.value.find(c => c.id === id)
  if (card) {
    card.completed = !card.completed
    if (card.completed) {
      card.colorClass = 'bg-green-500'
      card.status = '已完成'
      card.statusClass = 'bg-green-100 text-green-800'
    } else {
      card.colorClass = 'bg-yellow-500'
      card.status = '待处理'
      card.statusClass = 'bg-yellow-100 text-yellow-800'
    }
  }
}

function openSyncChangesModal() {
  showSyncModal.value = true
}

function closeSyncChangesModal() {
  showSyncModal.value = false
}

function openPermissionModal(id, title, description) {
  permissionForm.description = description
  permissionForm.reason = ''
  permissionForm.dateTime = getCurrentDateTime()
  permissionForm.submitted = false
  showPermissionModal.value = true
}

function closePermissionModal() {
  showPermissionModal.value = false
}

function submitPermissionRequest() {
  if (!permissionForm.reason || permissionForm.reason.length < 50) {
    alert('请输入至少50个字的申请原因')
    return
  }
  if (!permissionForm.dateTime) {
    alert('请选择申请时间')
    return
  }
  permissionForm.submitted = true
  alert('权限申请已提交，等待审批中...')
}

function downloadFile(id) {
  alert(`正在下载文件(ID: ${id})...`)
}
</script>
