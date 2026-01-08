<template>
  <div class="flex flex-col h-full">
    <!-- 表格工具栏 -->
    <div class="bg-white border-b-4 border-black p-4 space-y-3 shadow-neo-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <input type="text" placeholder="SEARCH TABLE..." 
            class="neo-input px-3 py-2 bg-white text-black font-bold placeholder-gray-500 w-64 uppercase" />
          <select class="neo-input px-3 py-2 bg-white text-black font-bold uppercase cursor-pointer">
            <option>所有表格</option>
            <option>我创建的</option>
            <option>我有权访问的</option>
          </select>
        </div>
        <div class="flex space-x-2">
          <button @click="showCreateTableModal = true" 
            class="neo-btn bg-black text-white hover:bg-gray-800 text-sm flex items-center px-4 py-2">
            <iconify-icon icon="mdi:plus" class="mr-2 text-lg"></iconify-icon>
            NEW TABLE
          </button>
        </div>
      </div>
    </div>

    <!-- 表格列表 -->
    <div class="flex-1 overflow-y-auto p-4 bg-neo-white animate-fade-in-up">
      <div class="space-y-4">
        <div v-for="(table, index) in tables" :key="table.id" 
          @click="selectTable(table.id)"
          :style="{ animationDelay: `${index * 0.1}s` }"
          :class="['p-4 border-4 border-black cursor-pointer transition-all shadow-neo hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-fade-in-up', 
            selectedTableId === table.id 
              ? 'bg-neo-yellow' 
              : 'bg-white hover:bg-gray-50']">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="font-black text-xl text-black uppercase tracking-tight">{{ table.name }}</h3>
              <p class="text-sm font-bold text-gray-700 mt-1 border-l-4 border-black pl-2">{{ table.description }}</p>
              <div class="flex items-center space-x-4 mt-3 text-xs font-bold text-black uppercase">
                <span class="bg-white px-2 py-1 border-2 border-black">{{ table.columns }}列</span>
                <span class="bg-white px-2 py-1 border-2 border-black">{{ table.rows }}行</span>
                <span class="bg-neo-blue text-white px-2 py-1 border-2 border-black">拥有者: {{ table.owner }}</span>
              </div>
            </div>
            <div class="flex flex-col items-end space-y-1">
              <span v-if="table.myAccessLevel" 
                :class="['px-2 py-1 border-2 border-black text-xs font-black uppercase shadow-neo-sm',
                  table.myAccessLevel === 'edit' ? 'bg-neo-lime text-black' : 'bg-neo-pink text-black']">
                {{ table.myAccessLevel === 'edit' ? '可编辑' : '只读' }}
              </span>
              <span v-else class="px-2 py-1 bg-gray-200 border-2 border-black text-black text-xs font-black uppercase shadow-neo-sm">无权限</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格详情区域 -->
    <div v-if="selectedTableId" class="border-t-4 border-black h-1/2 flex flex-col bg-white">
      <!-- 详情工具栏 -->
      <div class="bg-neo-lime border-b-4 border-black p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <h3 class="font-black text-2xl uppercase tracking-tighter text-black">{{ selectedTable?.name }}</h3>
            <span v-if="isEditingBranch" class="px-2 py-1 bg-neo-pink text-black border-2 border-black text-xs font-black uppercase flex items-center shadow-neo-sm transform -rotate-2">
              <iconify-icon icon="mdi:source-branch" class="mr-1"></iconify-icon>
              {{ currentBranch }}
            </span>
            <span v-else class="px-2 py-1 bg-white text-black border-2 border-black text-xs font-black uppercase shadow-neo-sm">MAIN BRANCH</span>
          </div>
          <div class="flex space-x-2">
            <button v-if="selectedTable?.myAccessLevel === 'edit' && !isEditingBranch"
              @click="createBranch" 
              class="neo-btn bg-black text-white px-3 py-2 text-sm flex items-center hover:bg-gray-800">
              <iconify-icon icon="mdi:source-branch" class="mr-1"></iconify-icon>
              创建分支
            </button>
            <button v-if="isEditingBranch"
              @click="submitChanges" 
              class="neo-btn bg-neo-yellow text-black px-3 py-2 text-sm flex items-center hover:bg-yellow-400">
              <iconify-icon icon="mdi:check" class="mr-1"></iconify-icon>
              提交PR
            </button>
            <button v-if="selectedTable?.myAccessLevel"
              @click="exportTable" 
              class="neo-btn bg-white text-black px-3 py-2 text-sm flex items-center hover:bg-gray-100">
              <iconify-icon icon="mdi:download" class="mr-1"></iconify-icon>
              导出
            </button>
            <button v-if="!selectedTable?.myAccessLevel"
              @click="requestAccess" 
              class="neo-btn bg-neo-blue text-black px-3 py-2 text-sm flex items-center hover:bg-blue-600">
              <iconify-icon icon="mdi:plus-circle" class="mr-1"></iconify-icon>
              申请权限
            </button>
            <button @click="showTableHistory = true"
              class="neo-btn bg-white text-black px-3 py-2 text-sm flex items-center hover:bg-gray-100">
              <iconify-icon icon="mdi:history" class="mr-1"></iconify-icon>
              历史
            </button>
          </div>
        </div>

        <!-- 列选择器 -->
        <div v-if="selectedTable?.myAccessLevel" class="mt-3 flex items-center space-x-2">
          <span class="text-xs font-black uppercase text-black bg-white px-1 border-2 border-black">显示列:</span>
          <div class="flex flex-wrap gap-2">
            <label v-for="col in selectedTable.allColumns" :key="col" class="flex items-center text-xs font-bold uppercase cursor-pointer hover:bg-white hover:bg-opacity-50 px-1 rounded">
              <input type="checkbox" v-model="visibleColumns" :value="col" class="mr-1 accent-black w-4 h-4 border-2 border-black" />
              {{ col }}
            </label>
          </div>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="flex-1 overflow-auto bg-neo-white p-4">
        <div class="border-4 border-black shadow-neo bg-white">
          <table class="w-full border-collapse">
            <thead class="bg-black text-white sticky top-0">
              <tr>
                <th v-for="col in visibleColumns" :key="col" class="border-r-2 border-white px-4 py-3 text-left text-sm font-black uppercase last:border-r-0">
                  {{ col }}
                </th>
                <th v-if="isEditingBranch" class="border-r-2 border-white px-4 py-3 text-left text-sm font-black uppercase last:border-r-0">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y-2 divide-black">
              <tr v-for="(row, idx) in displayedTableData" :key="idx" class="hover:bg-neo-yellow transition-colors group">
                <td v-for="col in visibleColumns" :key="col" class="border-r-2 border-black px-4 py-2 text-sm font-bold text-black last:border-r-0">
                  <input v-if="isEditingBranch" v-model="row[col]" class="w-full px-2 py-1 border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none font-bold" />
                  <span v-else>{{ row[col] }}</span>
                </td>
                <td v-if="isEditingBranch" class="border-r-2 border-black px-4 py-2 text-sm font-bold text-black last:border-r-0">
                  <button @click="deleteRow(idx)" class="bg-neo-pink text-black border-2 border-black px-2 py-1 text-xs font-black uppercase hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 表格操作 -->
      <div v-if="isEditingBranch" class="bg-white border-t-4 border-black p-3 flex justify-end">
        <button @click="addRow" class="neo-btn bg-black text-white px-3 py-2 text-sm flex items-center hover:bg-gray-800">
          <iconify-icon icon="mdi:plus" class="mr-1"></iconify-icon>
          新增行
        </button>
      </div>
    </div>

    <!-- 权限申请弹窗 -->
    <div v-if="showPermissionRequestModal" class="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center backdrop-blur-sm">
      <div class="bg-white border-4 border-black shadow-neo w-96 p-8 relative">
        <h3 class="text-2xl font-black text-black uppercase mb-6 border-b-4 border-black pb-2">申请表格访问权限</h3>
        
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-black text-black uppercase mb-2">申请表格</label>
            <p class="text-black font-bold text-lg bg-neo-white border-2 border-black p-2">{{ selectedTable?.name }}</p>
          </div>

          <div>
            <label class="block text-sm font-black text-black uppercase mb-2">申请权限类型</label>
            <div class="space-y-3">
              <label class="flex items-center cursor-pointer group">
                <div class="relative">
                  <input type="radio" v-model="permissionRequest.type" value="view" class="peer sr-only" />
                  <div class="w-6 h-6 border-2 border-black bg-white peer-checked:bg-neo-blue transition-all"></div>
                </div>
                <span class="ml-3 text-sm font-bold text-black group-hover:underline uppercase">只读（查看）</span>
              </label>
              <label class="flex items-center cursor-pointer group">
                <div class="relative">
                  <input type="radio" v-model="permissionRequest.type" value="edit" class="peer sr-only" />
                  <div class="w-6 h-6 border-2 border-black bg-white peer-checked:bg-neo-lime transition-all"></div>
                </div>
                <span class="ml-3 text-sm font-bold text-black group-hover:underline uppercase">编辑</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-black text-black uppercase mb-2">申请的列 <span class="text-neo-pink">*</span></label>
            <div class="space-y-2 max-h-40 overflow-y-auto border-2 border-black p-3 bg-neo-white">
              <label v-for="col in selectedTable?.allColumns" :key="col" class="flex items-center cursor-pointer hover:bg-white p-1 border border-transparent hover:border-black">
                <input type="checkbox" v-model="permissionRequest.columns" :value="col" class="mr-2 accent-black w-4 h-4 border-2 border-black cursor-pointer" />
                <span class="text-sm font-bold text-black uppercase">{{ col }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-black text-black uppercase mb-2">申请原因</label>
            <textarea v-model="permissionRequest.reason"
              placeholder="YOUR REASON..."
              class="neo-input w-full px-3 py-2 bg-white text-black font-bold text-sm uppercase"
              rows="3"></textarea>
          </div>
        </div>

        <div class="flex gap-4 mt-8">
          <button @click="showPermissionRequestModal = false" 
            class="neo-btn flex-1 bg-white text-black hover:bg-gray-100">取消</button>
          <button @click="submitPermissionRequest" 
            class="neo-btn flex-1 bg-black text-white hover:bg-gray-800">提交申请</button>
        </div>
      </div>
    </div>

    <!-- 表格历史弹窗 -->
    <div v-if="showTableHistory" class="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center backdrop-blur-sm">
      <div class="bg-white border-4 border-black shadow-neo w-2/3 max-h-96 flex flex-col p-0">
        <div class="flex justify-between items-center p-6 border-b-4 border-black bg-neo-yellow">
          <h3 class="text-2xl font-black text-black uppercase">表格历史版本</h3>
          <button @click="showTableHistory = false" class="text-black hover:scale-110 transition-transform bg-white border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
            <iconify-icon icon="mdi:close" class="text-xl"></iconify-icon>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-4 p-6 bg-neo-white">
          <div v-for="version in tableVersions" :key="version.id"
            @click="selectVersion(version.id)"
            :class="['p-4 border-4 border-black cursor-pointer transition-all shadow-neo-sm hover:shadow-neo', 
              selectedVersionId === version.id ? 'bg-neo-blue' : 'bg-white hover:-translate-y-1']">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-1">
                  <span class="font-black text-lg text-black uppercase">{{ version.author }}</span>
                  <span class="text-xs font-bold bg-black text-white px-2 py-0.5">{{ version.timestamp }}</span>
                </div>
                <p class="text-sm font-bold text-black border-l-4 border-black pl-2" :class="selectedVersionId === version.id ? 'text-white border-white' : ''">{{ version.message }}</p>
              </div>
              <button v-if="version.isPR" class="px-2 py-1 bg-neo-pink text-black border-2 border-black text-xs font-black uppercase shadow-neo-sm transform rotate-2">
                PR #{{ version.prNumber }}
              </button>
            </div>
            <div v-if="selectedVersionId === version.id && version.changes" class="mt-4 pt-4 border-t-4 border-black border-dashed">
              <p class="text-xs font-black text-white uppercase mb-2 bg-black inline-block px-1">修改详情:</p>
              <div class="text-xs space-y-2 font-bold">
                <div v-for="change in version.changes" :key="`${change.row}-${change.col}`"
                  :class="['px-3 py-2 border-2 border-black shadow-neo-sm', change.type === 'add' ? 'bg-neo-lime text-black' : 'bg-neo-yellow text-black']">
                  {{ change.type === 'add' ? '新增' : '修改' }} 第 {{ change.row }} 行, 列 {{ change.col }}: 
                  <span v-if="change.oldValue" class="line-through decoration-2 decoration-red-500">{{ change.oldValue }}</span> 
                  → {{ change.newValue }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 border-t-4 border-black bg-white flex justify-end">
          <button @click="showTableHistory = false" 
            class="neo-btn bg-black text-white hover:bg-gray-800 px-6 py-2">关闭</button>
        </div>
      </div>
    </div>

    <!-- 表格详情弹窗 -->
    <TableDetail v-if="showDetailModal" 
      :tableId="selectedTableId"
      :tableData="selectedTable"
      @close="closeDetailModal" />

    <!-- 创建表格弹窗 -->
    <div v-if="showCreateTableModal" class="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center backdrop-blur-sm">
      <div class="bg-white border-4 border-black shadow-neo w-96 p-8 relative">
        <h3 class="text-2xl font-black text-black uppercase mb-6 border-b-4 border-black pb-2">新建表格</h3>
        
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-black text-black uppercase mb-2">表格名称</label>
            <input v-model="newTable.name" type="text" placeholder="TABLE NAME..."
              class="neo-input w-full px-3 py-2 bg-white text-black font-bold uppercase" />
          </div>

          <div>
            <label class="block text-sm font-black text-black uppercase mb-2">表格描述</label>
            <textarea v-model="newTable.description" placeholder="DESCRIPTION..."
              class="neo-input w-full px-3 py-2 bg-white text-black font-bold uppercase" rows="3"></textarea>
          </div>

          <div>
            <label class="block text-sm font-black text-black uppercase mb-2">列名（用逗号分隔）</label>
            <input v-model="newTable.columns" type="text" placeholder="ID,NAME,DEPT..."
              class="neo-input w-full px-3 py-2 bg-white text-black font-bold uppercase" />
          </div>
        </div>

        <div class="flex gap-4 mt-8">
          <button @click="showCreateTableModal = false" 
            class="neo-btn flex-1 bg-white text-black hover:bg-gray-100">取消</button>
          <button @click="createNewTable" 
            class="neo-btn flex-1 bg-black text-white hover:bg-gray-800">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TableDetail from './TableDetail.vue'

const selectedTableId = ref(1)
const showCreateTableModal = ref(false)
const showPermissionRequestModal = ref(false)
const showTableHistory = ref(false)
const showDetailModal = ref(false)
const selectedVersionId = ref(null)
const isEditingBranch = ref(false)
const currentBranch = ref('')
const visibleColumns = ref([])

const newTable = ref({
  name: '',
  description: '',
  columns: ''
})

const permissionRequest = ref({
  type: 'view',
  columns: [],
  reason: ''
})

const tables = ref([
  {
    id: 1,
    name: '项目信息表',
    description: '公司所有项目的基本信息',
    columns: 8,
    rows: 24,
    owner: '张工',
    myAccessLevel: 'edit',
    allColumns: ['项目ID', '项目名称', '负责人', '开始时间', '预期完成时间', '状态', '预算', '实际支出'],
    versionHistory: [
      { message: '添加预算审批字段', type: 'add', author: '张工', timestamp: '2025-12-08 14:30', details: '新增预算审批状态字段以支持多级审批流程' },
      { message: '修改项目状态枚举', type: 'update', author: '李技术', timestamp: '2025-12-07 10:15', details: '将项目状态从简单三态改为五态管理' },
      { message: '初始化表结构', type: 'add', author: '王经理', timestamp: '2025-12-01 09:00', details: '创建项目信息表基础结构' }
    ]
  },
  {
    id: 2,
    name: '员工绩效表',
    description: '员工月度绩效评分',
    columns: 6,
    rows: 156,
    owner: '王经理',
    myAccessLevel: 'view',
    allColumns: ['员工ID', '员工名称', '部门', '月份', '绩效评分', '备注'],
    versionHistory: [
      { message: '新增部门排名字段', type: 'add', author: '王经理', timestamp: '2025-12-06 16:45', details: '用于部门内绩效对比' },
      { message: '初始化表结构', type: 'add', author: '李技术', timestamp: '2025-11-20 08:30', details: '创建员工绩效评分表' }
    ]
  },
  {
    id: 3,
    name: '财务预算表',
    description: '各部门预算和支出追踪',
    columns: 7,
    rows: 12,
    owner: '李财务',
    myAccessLevel: null,
    allColumns: ['部门', '预算总额', '已支出', '预留', '年份', '审批状态', '负责人'],
    versionHistory: []
  },
  {
    id: 4,
    name: '客户管理表',
    description: '公司客户信息管理',
    columns: 9,
    rows: 342,
    owner: '销售部',
    myAccessLevel: 'edit',
    allColumns: ['客户ID', '客户名称', '行业', '联系电话', '地址', '合作状态', '合同金额', '业务负责人', '最后联系时间'],
    versionHistory: [
      { message: '更新客户分类方案', type: 'update', author: '销售部', timestamp: '2025-12-05 13:20', details: '根据合作规模重新分类客户等级' },
      { message: '初始化客户数据库', type: 'add', author: '李技术', timestamp: '2025-11-01 10:00', details: '导入企业ERP系统的客户信息' }
    ]
  }
])

const selectedTable = computed(() => tables.value.find(t => t.id === selectedTableId.value))

const tableData = {
  1: [
    { '项目ID': 'P001', '项目名称': '数据平台升级', '负责人': '张工', '开始时间': '2025-01-15', '预期完成时间': '2025-03-31', '状态': '进行中', '预算': '500000', '实际支出': '320000' },
    { '项目ID': 'P002', '项目名称': 'AI助手系统', '负责人': '李技术', '开始时间': '2025-02-01', '预期完成时间': '2025-04-30', '状态': '进行中', '预算': '800000', '实际支出': '180000' }
  ],
  2: [
    { '员工ID': 'E001', '员工名称': '张工', '部门': '技术部', '月份': '2025-12', '绩效评分': '92', '备注': '表现优秀' },
    { '员工ID': 'E002', '员工名称': '王经理', '部门': '项目部', '月份': '2025-12', '绩效评分': '88', '备注': '完成指标' }
  ],
  3: [],
  4: [
    { '客户ID': 'C001', '客户名称': '阿里巴巴', '行业': '互联网', '联系电话': '010-xxxx', '地址': '杭州', '合作状态': '合作中', '合同金额': '5000000', '业务负责人': '销售A', '最后联系时间': '2025-12-08' }
  ]
}

const displayedTableData = computed(() => {
  const data = tableData[selectedTableId.value] || []
  if (isEditingBranch.value) {
    return [...data]
  }
  return data
})

const tableVersions = ref([
  {
    id: 1,
    author: '张工',
    timestamp: '2025-12-08 14:30',
    message: '添加预算支出列',
    isPR: true,
    prNumber: 12,
    changes: [
      { row: 1, col: '实际支出', type: 'add', oldValue: null, newValue: '320000' }
    ]
  },
  {
    id: 2,
    author: '李技术',
    timestamp: '2025-12-07 10:15',
    message: '更新项目状态',
    isPR: true,
    prNumber: 11,
    changes: [
      { row: 2, col: '状态', type: 'modify', oldValue: '待启动', newValue: '进行中' }
    ]
  },
  {
    id: 3,
    author: '王经理',
    timestamp: '2025-12-06 09:00',
    message: '初始版本',
    isPR: false,
    prNumber: null,
    changes: []
  }
])

function selectTable(tableId) {
  selectedTableId.value = tableId
  selectedVersionId.value = null
  isEditingBranch.value = false
  visibleColumns.value = selectedTable.value?.allColumns || []
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
}

function createBranch() {
  const branchName = prompt('输入分支名称（如: feature/add-column）:')
  if (branchName) {
    isEditingBranch.value = true
    currentBranch.value = branchName
  }
}

function submitChanges() {
  const prTitle = prompt('请输入PR标题:')
  const prDescription = prompt('请输入PR描述:')
  
  if (prTitle && prDescription) {
    alert(`PR已提交！\n标题: ${prTitle}\n描述: ${prDescription}\n\n等待管理员审批...`)
    isEditingBranch.value = false
    currentBranch.value = ''
  }
}

function exportTable() {
  const csvData = [
    visibleColumns.value.join(','),
    ...displayedTableData.value.map(row => 
      visibleColumns.value.map(col => row[col] || '').join(',')
    )
  ].join('\n')
  
  const blob = new Blob([csvData], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedTable.value?.name || '表格'}.csv`
  a.click()
}

function requestAccess() {
  permissionRequest.value.columns = []
  showPermissionRequestModal.value = true
}

function submitPermissionRequest() {
  if (permissionRequest.value.columns.length === 0) {
    alert('请至少选择一列')
    return
  }
  alert(`权限申请已提交！\n申请访问: ${permissionRequest.value.columns.join(', ')}\n权限类型: ${permissionRequest.value.type === 'view' ? '只读' : '编辑'}\n\n等待管理员审批...`)
  showPermissionRequestModal.value = false
}

function selectVersion(versionId) {
  selectedVersionId.value = selectedVersionId.value === versionId ? null : versionId
}

function addRow() {
  const newRow = {}
  visibleColumns.value.forEach(col => {
    newRow[col] = ''
  })
  displayedTableData.value.push(newRow)
}

function deleteRow(index) {
  displayedTableData.value.splice(index, 1)
}

function createNewTable() {
  if (!newTable.value.name || !newTable.value.columns) {
    alert('请填写表格名称和列名')
    return
  }
  
  const columns = newTable.value.columns.split(',').map(c => c.trim())
  const newId = Math.max(...tables.value.map(t => t.id)) + 1
  
  tables.value.push({
    id: newId,
    name: newTable.value.name,
    description: newTable.value.description,
    columns: columns.length,
    rows: 0,
    owner: '当前用户',
    myAccessLevel: 'edit',
    allColumns: columns
  })
  
  newTable.value = { name: '', description: '', columns: '' }
  showCreateTableModal.value = false
  selectTable(newId)
}
</script>
