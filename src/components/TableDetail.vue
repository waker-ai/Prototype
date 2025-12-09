<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div class="bg-white rounded-2xl shadow-2xl w-11/12 h-5/6 max-w-7xl flex flex-col">
      <!-- 头部 -->
      <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-6 flex items-center justify-between rounded-t-2xl">
        <div>
          <h1 class="text-3xl font-bold">{{ table?.name }}</h1>
          <p class="text-indigo-100 mt-1">{{ table?.description }}</p>
        </div>
        <button @click="closeModal" class="text-white hover:bg-indigo-800 rounded-full p-2 transition">
          <iconify-icon icon="mdi:close" class="text-2xl"></iconify-icon>
        </button>
      </div>

      <!-- 标签页导航 -->
      <div class="flex border-b border-gray-200 bg-white px-8">
        <button 
          v-for="tab in detailTabs" :key="tab.id"
          @click="activeTab = tab.id"
          :class="['px-6 py-4 font-medium transition',
            activeTab === tab.id
              ? 'text-indigo-700 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-indigo-700']">
          <iconify-icon :icon="tab.icon" class="inline-block mr-2"></iconify-icon>
          {{ tab.label }}
        </button>
      </div>

      <!-- 标签页内容 -->
      <div class="flex-1 overflow-hidden bg-gray-50">
        <!-- 数据预览标签 -->
        <div v-if="activeTab === 'preview'" class="h-full flex flex-col p-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 overflow-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 sticky top-0">
                <tr>
                  <th v-for="col in table?.allColumns" :key="col"
                    class="px-6 py-3 text-left font-semibold text-gray-700 border-b border-gray-200">
                    {{ col }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in currentTableData" :key="idx" 
                  class="hover:bg-gray-50 border-b border-gray-200">
                  <td v-for="col in table?.allColumns" :key="col" 
                    class="px-6 py-4 text-gray-700">
                    {{ row[col] || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 分支信息标签 -->
        <div v-if="activeTab === 'branches'" class="h-full flex flex-col p-6">
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div class="text-4xl font-bold text-indigo-600">1</div>
              <div class="text-gray-600 mt-1">活跃分支</div>
            </div>
            <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div class="text-4xl font-bold text-green-600">3</div>
              <div class="text-gray-600 mt-1">待审批PR</div>
            </div>
            <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div class="text-4xl font-bold text-blue-600">{{ table?.rows }}</div>
              <div class="text-gray-600 mt-1">总记录数</div>
            </div>
          </div>

          <h3 class="font-semibold text-gray-900 mb-4">最近的分支活动</h3>
          <div class="space-y-3">
            <div v-for="i in 3" :key="i" class="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition">
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-medium text-gray-900">feature/add-columns-{{ i }}</p>
                  <p class="text-sm text-gray-600 mt-1">由 张工 创建于 2025-12-{{ 9-i }} 15:{{ 30+i*10 }}</p>
                  <p class="text-xs text-gray-500 mt-2">{{ i*2 }} 条变更</p>
                </div>
                <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">待审批</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 权限设置标签 -->
        <div v-if="activeTab === 'permissions'" class="h-full flex flex-col p-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-6 border-b border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-4">访问权限</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p class="font-medium text-gray-900">{{ table?.owner }}</p>
                    <p class="text-sm text-gray-600">表格所有者</p>
                  </div>
                  <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">管理员</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p class="font-medium text-gray-900">李技术</p>
                    <p class="text-sm text-gray-600">编辑权限</p>
                  </div>
                  <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">编辑</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p class="font-medium text-gray-900">王经理</p>
                    <p class="text-sm text-gray-600">查看权限</p>
                  </div>
                  <span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">只读</span>
                </div>
              </div>
            </div>
            <div class="p-6">
              <h3 class="font-semibold text-gray-900 mb-4">权限请求</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div>
                    <p class="font-medium text-gray-900">张大明</p>
                    <p class="text-sm text-gray-600">申请编辑权限</p>
                  </div>
                  <div class="flex space-x-2">
                    <button class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">批准</button>
                    <button class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">拒绝</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 版本历史标签 -->
        <div v-if="activeTab === 'history'" class="h-full flex flex-col p-6">
          <div class="space-y-4">
            <div v-for="(record, idx) in (table?.versionHistory || [])" :key="idx"
              class="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="font-medium text-gray-900 flex items-center">
                    <iconify-icon icon="mdi:git-commit" class="mr-2 text-indigo-600"></iconify-icon>
                    {{ record.message }}
                  </p>
                  <p class="text-sm text-gray-600 mt-1">by {{ record.author }} • {{ record.timestamp }}</p>
                </div>
                <span class="px-3 py-1 text-xs font-medium rounded-full"
                  :class="record.type === 'add' ? 'bg-green-100 text-green-800' :
                           record.type === 'delete' ? 'bg-red-100 text-red-800' :
                           'bg-blue-100 text-blue-800'">
                  {{ record.type === 'add' ? '添加' : record.type === 'delete' ? '删除' : '修改' }}
                </span>
              </div>
              <div class="text-sm text-gray-600 ml-6">
                {{ record.details }}
              </div>
            </div>
          </div>
        </div>

        <!-- 统计信息标签 -->
        <div v-if="activeTab === 'stats'" class="h-full flex flex-col p-6">
          <div class="grid grid-cols-2 gap-6">
            <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-4">基本统计</h3>
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">总行数</span>
                  <span class="font-medium text-gray-900">{{ table?.rows }}</span>
                </div>
                <div class="flex justify-between text-sm border-t pt-3">
                  <span class="text-gray-600">总列数</span>
                  <span class="font-medium text-gray-900">{{ table?.columns }}</span>
                </div>
                <div class="flex justify-between text-sm border-t pt-3">
                  <span class="text-gray-600">所有者</span>
                  <span class="font-medium text-gray-900">{{ table?.owner }}</span>
                </div>
                <div class="flex justify-between text-sm border-t pt-3">
                  <span class="text-gray-600">创建时间</span>
                  <span class="font-medium text-gray-900">2025-12-01</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-4">访问统计</h3>
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">访问者数</span>
                  <span class="font-medium text-gray-900">12</span>
                </div>
                <div class="flex justify-between text-sm border-t pt-3">
                  <span class="text-gray-600">总访问次数</span>
                  <span class="font-medium text-gray-900">156</span>
                </div>
                <div class="flex justify-between text-sm border-t pt-3">
                  <span class="text-gray-600">最后修改</span>
                  <span class="font-medium text-gray-900">2小时前</span>
                </div>
                <div class="flex justify-between text-sm border-t pt-3">
                  <span class="text-gray-600">分支数量</span>
                  <span class="font-medium text-gray-900">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-between rounded-b-2xl">
        <div class="text-sm text-gray-600">
          <iconify-icon icon="mdi:information-outline" class="mr-1"></iconify-icon>
          表格ID: {{ table?.id }}
        </div>
        <div class="flex space-x-3">
          <button @click="exportTable" 
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm flex items-center">
            <iconify-icon icon="mdi:download" class="mr-1"></iconify-icon>
            导出
          </button>
          <button @click="closeModal"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  tableId: String,
  tableData: Object
})

const emit = defineEmits(['close'])

const activeTab = ref('preview')

const detailTabs = [
  { id: 'preview', label: '数据预览', icon: 'mdi:table' },
  { id: 'branches', label: '分支信息', icon: 'mdi:source-branch' },
  { id: 'permissions', label: '权限设置', icon: 'mdi:lock-outline' },
  { id: 'history', label: '版本历史', icon: 'mdi:history' },
  { id: 'stats', label: '统计信息', icon: 'mdi:chart-line' }
]

const table = computed(() => props.tableData)

const currentTableData = computed(() => {
  if (!props.tableData || !props.tableData.id) return []
  const dataMap = {
    'tb001': [
      { '项目名': 'I项目', '状态': '进行中', '负责人': '张工', '开始日期': '2025-01-15', '预算': '100万' },
      { '项目名': '慧人天', '状态': '完成', '负责人': '王经理', '开始日期': '2025-02-01', '预算': '80万' }
    ],
    'tb002': [
      { '员工': '张工', '部门': '技术部', '评分': '95', '等级': 'A', '评价': '表现优异' },
      { '员工': '李技术', '部门': '技术部', '评分': '88', '等级': 'B', '评价': '工作认真' }
    ]
  }
  return dataMap[props.tableData.id] || []
})

function closeModal() {
  emit('close')
}

function exportTable() {
  alert(`表格 "${props.tableData.name}" 正在导出为CSV...`)
}
</script>
