<template>
  <div class="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in-up">
    <div class="bg-white rounded-none shadow-neo w-11/12 h-5/6 max-w-7xl flex flex-col border-4 border-black animate-pop-in">
      <!-- 头部 -->
      <div class="bg-neo-lime text-black px-8 py-6 flex items-center justify-between border-b-4 border-black">
        <div>
          <h1 class="text-4xl font-black uppercase tracking-tight">{{ table?.name }}</h1>
          <p class="text-black font-bold mt-1 text-sm border-l-4 border-black pl-2">{{ table?.description }}</p>
        </div>
        <button @click="closeModal" class="neo-btn bg-black text-white p-2 hover:bg-gray-800 transition-all">
          <iconify-icon icon="mdi:close" class="text-2xl"></iconify-icon>
        </button>
      </div>

      <!-- 标签页导航 -->
      <div class="flex border-b-4 border-black bg-white px-8 pt-4 gap-2">
        <button 
          v-for="tab in detailTabs" :key="tab.id"
          @click="activeTab = tab.id"
          :class="['px-6 py-3 font-black uppercase transition-all border-t-4 border-x-4 border-black -mb-1',
            activeTab === tab.id
              ? 'bg-neo-yellow text-black shadow-[4px_-4px_0_0_#000]'
              : 'bg-white text-gray-500 hover:bg-gray-100 border-transparent hover:border-black']">
          <iconify-icon :icon="tab.icon" class="inline-block mr-2"></iconify-icon>
          {{ tab.label }}
        </button>
      </div>

      <!-- 标签页内容 -->
      <div class="flex-1 overflow-hidden bg-neo-white border-t-4 border-black">
        <!-- 数据预览标签 -->
        <div v-if="activeTab === 'preview'" class="h-full flex flex-col p-6">
          <div class="bg-white border-4 border-black shadow-neo flex-1 overflow-auto">
            <table class="w-full text-sm border-collapse">
              <thead class="bg-black text-white sticky top-0 z-10">
                <tr>
                  <th v-for="col in table?.allColumns" :key="col"
                    class="px-6 py-4 text-left font-black uppercase border-r-2 border-white last:border-r-0">
                    {{ col }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y-2 divide-black">
                <tr v-for="(row, idx) in currentTableData" :key="idx" 
                  class="hover:bg-neo-yellow transition-colors">
                  <td v-for="col in table?.allColumns" :key="col" 
                    class="px-6 py-4 text-black font-bold border-r-2 border-black last:border-r-0">
                    {{ row[col] || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 分支信息标签 -->
        <div v-if="activeTab === 'branches'" class="h-full flex flex-col p-6">
          <div class="grid grid-cols-3 gap-6 mb-8">
            <div class="bg-white p-4 border-4 border-black shadow-neo">
              <div class="text-5xl font-black text-black">1</div>
              <div class="text-black font-bold mt-1 uppercase bg-neo-lime inline-block px-2 border-2 border-black">活跃分支</div>
            </div>
            <div class="bg-white p-4 border-4 border-black shadow-neo">
              <div class="text-5xl font-black text-black">3</div>
              <div class="text-black font-bold mt-1 uppercase bg-neo-yellow inline-block px-2 border-2 border-black">待审批PR</div>
            </div>
            <div class="bg-white p-4 border-4 border-black shadow-neo">
              <div class="text-5xl font-black text-black">{{ table?.rows }}</div>
              <div class="text-black font-bold mt-1 uppercase bg-neo-blue text-white inline-block px-2 border-2 border-black">总记录数</div>
            </div>
          </div>

          <h3 class="font-black text-black text-2xl uppercase mb-4 border-b-4 border-black inline-block">最近的分支活动</h3>
          <div class="space-y-4">
            <div v-for="i in 3" :key="i" class="bg-white p-4 border-4 border-black shadow-neo-sm hover:shadow-neo hover:-translate-y-1 transition-all">
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-black text-black text-lg">feature/add-columns-{{ i }}</p>
                  <p class="text-sm font-bold text-gray-600 mt-1">由 张工 创建于 2025-12-{{ 9-i }} 15:{{ 30+i*10 }}</p>
                  <p class="text-xs font-bold text-black mt-2 bg-neo-blue text-white inline-block px-1">{{ i*2 }} 条变更</p>
                </div>
                <span class="px-3 py-1 bg-neo-yellow text-black border-2 border-black text-xs font-black uppercase shadow-neo-sm">待审批</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 权限设置标签 -->
        <div v-if="activeTab === 'permissions'" class="h-full flex flex-col p-6">
          <div class="bg-white border-4 border-black shadow-neo overflow-hidden h-full flex flex-col">
            <div class="p-6 border-b-4 border-black bg-neo-white">
              <h3 class="font-black text-black text-xl uppercase mb-4">访问权限</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-white border-2 border-black shadow-neo-sm">
                  <div>
                    <p class="font-black text-black uppercase">{{ table?.owner }}</p>
                    <p class="text-sm font-bold text-gray-600">表格所有者</p>
                  </div>
                  <span class="px-3 py-1 bg-neo-pink text-black border-2 border-black text-sm font-black uppercase">管理员</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-white border-2 border-black shadow-neo-sm">
                  <div>
                    <p class="font-black text-black">李技术</p>
                    <p class="text-sm font-bold text-gray-600">编辑权限</p>
                  </div>
                  <span class="px-3 py-1 bg-neo-lime text-black border-2 border-black text-sm font-black uppercase">编辑</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-white border-2 border-black shadow-neo-sm">
                  <div>
                    <p class="font-black text-black">王经理</p>
                    <p class="text-sm font-bold text-gray-600">查看权限</p>
                  </div>
                  <span class="px-3 py-1 bg-gray-200 text-black border-2 border-black text-sm font-black uppercase">只读</span>
                </div>
              </div>
            </div>
            <div class="p-6 bg-white flex-1 overflow-auto">
              <h3 class="font-black text-black text-xl uppercase mb-4">权限请求</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-4 border-4 border-black bg-neo-yellow shadow-neo-sm">
                  <div>
                    <p class="font-black text-black text-lg">张大明</p>
                    <p class="text-sm font-bold text-black mt-1">申请编辑权限</p>
                  </div>
                  <div class="flex space-x-3">
                    <button class="neo-btn bg-black text-neo-lime text-sm px-4">批准</button>
                    <button class="neo-btn bg-white text-black text-sm px-4">拒绝</button>
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
              class="bg-white p-4 border-4 border-black shadow-neo-sm hover:shadow-neo transition-all">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="font-black text-black text-lg flex items-center uppercase">
                    <iconify-icon icon="mdi:git-commit" class="mr-2 text-black"></iconify-icon>
                    {{ record.message }}
                  </p>
                  <p class="text-sm font-bold text-gray-600 mt-1">by {{ record.author }} • {{ record.timestamp }}</p>
                </div>
                <span class="px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-neo-sm"
                  :class="record.type === 'add' ? 'bg-neo-lime text-black' :
                           record.type === 'delete' ? 'bg-neo-pink text-black' :
                           'bg-neo-blue text-white'">
                  {{ record.type === 'add' ? '添加' : record.type === 'delete' ? '删除' : '修改' }}
                </span>
              </div>
              <div class="text-sm font-bold text-black ml-8 p-2 bg-gray-100 border-l-4 border-black">
                {{ record.details }}
              </div>
            </div>
          </div>
        </div>

        <!-- 统计信息标签 -->
        <div v-if="activeTab === 'stats'" class="h-full flex flex-col p-6">
          <div class="grid grid-cols-2 gap-8">
            <div class="bg-white p-6 border-4 border-black shadow-neo">
              <h3 class="font-black text-black text-xl uppercase mb-4 border-b-4 border-black pb-2">基本统计</h3>
              <div class="space-y-4">
                <div class="flex justify-between text-base">
                  <span class="font-bold text-gray-600 uppercase">总行数</span>
                  <span class="font-black text-black text-lg">{{ table?.rows }}</span>
                </div>
                <div class="flex justify-between text-base border-t-2 border-dashed border-gray-300 pt-3">
                  <span class="font-bold text-gray-600 uppercase">总列数</span>
                  <span class="font-black text-black text-lg">{{ table?.columns }}</span>
                </div>
                <div class="flex justify-between text-base border-t-2 border-dashed border-gray-300 pt-3">
                  <span class="font-bold text-gray-600 uppercase">所有者</span>
                  <span class="font-black text-black text-lg">{{ table?.owner }}</span>
                </div>
                <div class="flex justify-between text-base border-t-2 border-dashed border-gray-300 pt-3">
                  <span class="font-bold text-gray-600 uppercase">创建时间</span>
                  <span class="font-black text-black text-lg">2025-12-01</span>
                </div>
              </div>
            </div>

            <div class="bg-white p-6 border-4 border-black shadow-neo">
              <h3 class="font-black text-black text-xl uppercase mb-4 border-b-4 border-black pb-2">访问统计</h3>
              <div class="space-y-4">
                <div class="flex justify-between text-base">
                  <span class="font-bold text-gray-600 uppercase">访问者数</span>
                  <span class="font-black text-black text-lg">12</span>
                </div>
                <div class="flex justify-between text-base border-t-2 border-dashed border-gray-300 pt-3">
                  <span class="font-bold text-gray-600 uppercase">总访问次数</span>
                  <span class="font-black text-black text-lg">156</span>
                </div>
                <div class="flex justify-between text-base border-t-2 border-dashed border-gray-300 pt-3">
                  <span class="font-bold text-gray-600 uppercase">最后修改</span>
                  <span class="font-black text-black text-lg">2小时前</span>
                </div>
                <div class="flex justify-between text-base border-t-2 border-dashed border-gray-300 pt-3">
                  <span class="font-bold text-gray-600 uppercase">分支数量</span>
                  <span class="font-black text-black text-lg">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="bg-white border-t-4 border-black px-8 py-4 flex items-center justify-between">
        <div class="text-sm font-bold text-gray-600 flex items-center">
          <iconify-icon icon="mdi:information-outline" class="mr-1 text-lg text-black"></iconify-icon>
          <span class="bg-gray-200 px-2 py-1 border border-black">表格ID: {{ table?.id }}</span>
        </div>
        <div class="flex space-x-4">
          <button @click="exportTable" 
            class="neo-btn bg-white text-black flex items-center border-none shadow-none hover:shadow-neo hover:-translate-y-1 hover:border-black hover:border-2">
            <iconify-icon icon="mdi:download" class="mr-1"></iconify-icon>
            导出
          </button>
          <button @click="closeModal"
            class="neo-btn bg-black text-white hover:bg-gray-800">
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
