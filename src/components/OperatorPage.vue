<template>
  <div class="bg-gray-50 min-h-screen font-sans flex flex-col">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-10 bg-white shadow-sm h-20 flex items-center px-8">
      <div class="flex items-center space-x-3">
        <iconify-icon class="text-indigo-700 text-2xl" icon="material-symbols:rocket-launch"></iconify-icon>
        <h1 class="text-2xl font-bold text-gray-900">表格管理平台</h1>
      </div>
      <div class="ml-auto flex items-center space-x-6">
        <div class="relative">
          <input
              v-model="searchQuery"
              class="w-64 px-4 py-2 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="搜索表格..." type="text" />
          <iconify-icon class="absolute right-3 top-2.5 text-gray-500 text-xl" icon="mdi:magnify"></iconify-icon>
        </div>
        <button @click="refreshData"
                :class="['px-4 py-2 rounded-lg flex items-center font-medium transition',
            isSyncing 
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700']"
                :disabled="isSyncing"
                title="刷新数据">
          <iconify-icon :icon="isSyncing ? 'mdi:loading' : 'mdi:refresh'"
                        :class="['mr-2 text-lg', isSyncing && 'animate-spin']"></iconify-icon>
          {{ isSyncing ? '刷新中...' : '刷新' }}
        </button>
        <!-- 演示按钮 (原型用) -->
        <div class="flex items-center space-x-1 border-l border-gray-300 pl-6">
          <button @click="showNotificationDemo('update')"
                  class="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition"
                  title="演示：表格被修改通知">
            表被改
          </button>
          <button @click="showNotificationDemo('permission')"
                  class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                  title="演示：获得权限通知">
            获权限
          </button>
        </div>
        <div class="flex items-center space-x-2 py-1">
          <div class="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10"></div>
          <span class="font-medium text-gray-700">操作者</span>
        </div>
        <router-link to="/admin" class="text-indigo-600 hover:text-indigo-800">
          管理员视图
        </router-link>
      </div>
    </header>
    <!-- 页面选项卡 -->
    <div class="bg-white border-b border-gray-200 px-8">
      <div class="flex items-center space-x-1">
        <button @click="currentPage = 'workspace'"
                :class="['px-6 py-3 font-medium transition border-b-2',
            currentPage === 'workspace'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-gray-600 hover:text-indigo-700']">
          <iconify-icon icon="mdi:table" class="inline mr-2"></iconify-icon>
          表格空间
        </button>
        <button @click="currentPage = 'apply'"
                :class="['px-6 py-3 font-medium transition border-b-2 relative',
            currentPage === 'apply'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-gray-600 hover:text-indigo-700']">
          <iconify-icon icon="mdi:plus-circle" class="inline mr-2"></iconify-icon>
          申请权限
          <span v-if="noAccessTables.length > 0" class="absolute top-1 right-0 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
            {{ noAccessTables.length }}
          </span>
        </button>
        <button @click="currentPage = 'dataSync'"
                :class="['px-6 py-3 font-medium transition border-b-2 relative',
            currentPage === 'dataSync'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-gray-600 hover:text-indigo-700']">
          <iconify-icon icon="mdi:cloud-sync" class="inline mr-2"></iconify-icon>
          数据同步
          <span v-if="pendingDataChangeRequests > 0" class="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{{ pendingDataChangeRequests }}</span>
        </button>
      </div>
    </div>
    <!-- 主容器 -->
    <div class="flex-1 overflow-hidden flex">
      <!-- 表格空间页面 -->
      <template v-if="currentPage === 'workspace'">
        <!-- 左侧：表格列表 -->
        <div class="w-80 bg-white rounded-xl shadow flex flex-col">
          <!-- 导入部分 -->
          <div class="border-b border-gray-200 p-4">
            <h2 class="text-lg font-bold text-gray-900 mb-3">导入表格</h2>
            <div class="space-y-2">
              <button @click="importTable"
                      class="w-full px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 text-sm flex items-center justify-center">
                <iconify-icon icon="mdi:import" class="mr-1"></iconify-icon>
                导入新表格
              </button>
            </div>
          </div>
          <!-- 表格列表 -->
          <div class="border-b border-gray-200 p-4">
            <h2 class="text-lg font-bold text-gray-900">表格列表</h2>
            <p class="text-xs text-gray-600 mt-1">共 {{ accessTables.length }} 个表格</p>
          </div>
          <div class="flex-1 overflow-y-auto">
            <div class="space-y-2 p-3">
              <div v-for="table in accessTables" :key="table.id"
                   :class="['p-3 rounded-lg border-l-4 transition hover:shadow-md',
                  selectedTableId === table.id
                    ? 'border-l-indigo-600 bg-indigo-50 border border-indigo-200'
                    : 'border-l-gray-300 bg-white border border-gray-200 hover:border-gray-300']">
                <div class="flex items-start justify-between">
                  <div class="flex-1 cursor-pointer" @click="selectTable(table.id)">
                    <h3 class="font-medium text-gray-900 text-sm">{{ table.name }}</h3>
                    <p class="text-xs text-gray-600 mt-1 line-clamp-1">{{ table.description }}</p>
                    <div class="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                      <span class="flex items-center">
                        <iconify-icon icon="mdi:table" class="mr-1"></iconify-icon>
                        {{ table.columns }} 列
                      </span>
                      <span class="flex items-center">
                        <iconify-icon icon="mdi:file-document" class="mr-1"></iconify-icon>
                        {{ table.rows }} 行
                      </span>
                    </div>
                  </div>
                  <!-- 三个点菜单 -->
                  <button @click="showTableOptions(table.id)" class="text-gray-400 hover:text-gray-600 ml-2">
                    <iconify-icon icon="mdi:dots-vertical" class="text-lg"></iconify-icon>
                  </button>
                </div>
                <div class="mt-2 flex items-center justify-between">
                  <span
                      :class="['px-2 py-0.5 rounded text-xs font-medium',
                      table.myAccessLevel === 'edit' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800']">
                    {{ table.myAccessLevel === 'edit' ? '可编辑' : '只读' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 右侧：表格详情或欢迎界面 -->
        <div class="flex-1 flex flex-col">
          <div v-if="!selectedTableId" class="bg-white rounded-xl shadow flex-1 flex items-center justify-center">
            <div class="text-center">
              <iconify-icon icon="mdi:table-large" class="text-6xl text-gray-300 mx-auto mb-4"></iconify-icon>
              <h3 class="text-xl font-bold text-gray-600 mb-2">请选择一个表格</h3>
              <p class="text-gray-500">点击左侧表格列表中的任何表格来查看详情</p>
            </div>
          </div>
          <!-- 显示表格详情 -->
          <div v-else class="bg-white rounded-xl shadow flex flex-col overflow-hidden">
            <!-- 表格详情头部 -->
            <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold">{{ selectedTable?.name }}</h2>
                <p class="text-indigo-100 text-sm mt-1">{{ selectedTable?.description }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <button v-if="selectedTable?.myAccessLevel === 'edit' && !isEditingTable"
                        @click="startEditingTable"
                        class="text-white hover:bg-indigo-800 rounded-lg px-3 py-2 flex items-center space-x-1 transition">
                  <iconify-icon icon="mdi:pencil" class="text-xl"></iconify-icon>
                  <span class="text-sm font-medium">编辑</span>
                </button>
                <button v-else-if="isEditingTable"
                        @click="cancelEditingTable"
                        class="text-white hover:bg-indigo-800 rounded-lg px-3 py-2 flex items-center space-x-1 transition">
                  <iconify-icon icon="mdi:close" class="text-xl"></iconify-icon>
                  <span class="text-sm font-medium">取消</span>
                </button>
                <button @click="exportTableData(selectedTableId)" class="text-white hover:bg-indigo-800 rounded-lg px-3 py-2 flex items-center space-x-1 transition">
                  <iconify-icon icon="mdi:download" class="text-xl"></iconify-icon>
                  <span class="text-sm font-medium">导出</span>
                </button>
                <button @click="selectedTableId = null" class="text-white hover:bg-indigo-800 rounded-full p-2">
                  <iconify-icon icon="mdi:close" class="text-2xl"></iconify-icon>
                </button>
              </div>
            </div>
            <!-- 编辑模式工具栏 -->
            <div v-if="isEditingTable" class="bg-yellow-50 border-b border-yellow-200 px-6 py-4 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <iconify-icon icon="mdi:alert-circle" class="text-yellow-600 text-xl"></iconify-icon>
                <div>
                  <p class="font-medium text-yellow-900">编辑模式</p>
                  <p class="text-xs text-yellow-700 mt-0.5">已修改 {{ changedRows.length }} 行</p>
                </div>
              </div>
              <button @click="submitTableChangesForReview"
                      :disabled="changedRows.length === 0"
                      :class="['px-4 py-2 rounded-lg flex items-center space-x-1 transition font-medium',
                  changedRows.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700']">
                <iconify-icon icon="mdi:check" class="text-lg"></iconify-icon>
                <span>提交审核</span>
              </button>
            </div>
            <!-- 表格预览/编辑 -->
            <div class="flex-1 overflow-auto p-6">
              <table class="w-full text-sm border-collapse">
                <thead class="bg-gray-100 sticky top-0">
                <tr>
                  <th v-if="isEditingTable" class="w-12 px-4 py-3 text-center font-semibold text-gray-700 border-b-2 border-gray-200">
                    状态
                  </th>
                  <th v-for="col in selectedTable?.allColumns" :key="col"
                      class="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                    {{ col }}
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(row, idx) in getTableData(selectedTableId)" :key="idx"
                    :class="['border-b border-gray-200',
                      isEditingTable && changedRows.includes(idx) ? 'bg-yellow-50' : 'hover:bg-gray-50']">
                  <td v-if="isEditingTable" class="w-12 px-4 py-3 text-center text-xs">
                      <span v-if="changedRows.includes(idx)" class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-medium">
                        修改
                      </span>
                  </td>
                  <td v-for="col in selectedTable?.allColumns" :key="col"
                      class="px-4 py-3 text-gray-700"
                      @click="isEditingTable ? startEditingCell(idx, col) : null"
                      :class="isEditingTable ? 'cursor-pointer hover:bg-indigo-50' : ''">
                    <div v-if="isEditingTable && editingTableData[`${idx}-${col}`] !== undefined"
                         class="relative">
                      <input v-model="editingTableData[`${idx}-${col}`]"
                             @blur="completeEditingCell(idx, col)"
                             @keydown.enter="completeEditingCell(idx, col)"
                             @keydown.escape="cancelEditingCell(idx, col)"
                             class="w-full px-2 py-1 border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                             autofocus />
                    </div>
                    <div v-else>
                      {{ row[col] || '-' }}
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
      <!-- 申请权限页面 -->
      <template v-else-if="currentPage === 'apply'">
        <!-- 左侧：导入和申请历史 -->
        <div class="w-80 bg-white rounded-xl shadow flex flex-col">
          <!-- 导入部分 -->
          <div class="border-b border-gray-200 p-4">
            <h2 class="text-lg font-bold text-gray-900 mb-3">导入表格</h2>
            <div class="space-y-2">
              <button @click="importTable"
                      class="w-full px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 text-sm flex items-center justify-center">
                <iconify-icon icon="mdi:import" class="mr-1"></iconify-icon>
                导入新表格
              </button>
            </div>
          </div>
          <!-- 申请历史 -->
          <div class="border-b border-gray-200 p-4">
            <h2 class="text-lg font-bold text-gray-900">申请历史</h2>
            <p class="text-xs text-gray-600 mt-1">共 {{ permissionHistory.length }} 条</p>
          </div>
          <div class="flex-1 overflow-y-auto">
            <div class="space-y-2 p-3">
              <div v-for="record in permissionHistory" :key="record.id"
                   :class="['p-3 rounded-lg border-l-4 transition hover:shadow-md cursor-pointer',
                  selectedApplyHistoryId === record.id
                    ? 'border-l-orange-600 bg-orange-50 border border-orange-200'
                    : 'border-l-gray-300 bg-white border border-gray-200 hover:border-gray-300']"
                   @click="selectedApplyHistoryId = record.id">
                <h3 class="font-medium text-gray-900 text-sm">{{ record.tableName }}</h3>
                <p class="text-xs text-gray-600 mt-1">申请：{{ record.type === 'view' ? '只读' : '编辑' }}</p>
                <div class="flex items-center justify-between mt-2">
                  <p class="text-xs text-gray-500">{{ record.submitTime.split(' ')[0] }}</p>
                  <span :class="['px-2 py-0.5 rounded text-xs font-medium',
                    record.status === 'approved' ? 'bg-green-100 text-green-800' :
                    record.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800']">
                    {{ record.status === 'approved' ? '已批准' : record.status === 'rejected' ? '已拒绝' : '待审核' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 右侧：申请权限的表格列表或申请历史详情 -->
        <div class="flex-1 flex flex-col">
          <!-- 选项卡 -->
          <div class="bg-white border-b border-gray-200 px-6">
            <div class="flex items-center space-x-1">
              <button @click="applyPageMode = 'list'"
                      :class="['px-6 py-3 font-medium transition border-b-2',
                  applyPageMode === 'list'
                    ? 'border-orange-600 text-orange-700'
                    : 'border-transparent text-gray-600 hover:text-orange-700']">
                <iconify-icon icon="mdi:table-search" class="inline mr-2"></iconify-icon>
                浏览表格
              </button>
              <button @click="applyPageMode = 'history'"
                      :class="['px-6 py-3 font-medium transition border-b-2',
                  applyPageMode === 'history'
                    ? 'border-orange-600 text-orange-700'
                    : 'border-transparent text-gray-600 hover:text-orange-700']">
                <iconify-icon icon="mdi:history" class="inline mr-2"></iconify-icon>
                申请历史详情
              </button>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow flex flex-col overflow-hidden flex-1">
            <!-- 浏览表格模式 -->
            <template v-if="applyPageMode === 'list'">
              <!-- 头部和搜索 -->
              <div class="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-4">
                <h2 class="text-2xl font-bold mb-4">申请权限</h2>
                <div class="relative">
                  <input v-model="applySearchQuery" type="text" placeholder="搜索表格..."
                         class="w-full px-4 py-2 bg-white bg-opacity-20 rounded-lg border border-orange-300 text-white placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-white" />
                  <iconify-icon icon="mdi:magnify" class="absolute right-3 top-2.5 text-orange-200 text-lg"></iconify-icon>
                </div>
              </div>
              <!-- 表格网格 -->
              <div class="flex-1 overflow-auto p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div v-for="table in filteredApplyTables" :key="table.id"
                       class="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex-1">
                        <h3 class="font-bold text-gray-900">{{ table.name }}</h3>
                        <p class="text-xs text-gray-600 mt-1 line-clamp-2">{{ table.description }}</p>
                      </div>
                    </div>
                    <div class="space-y-2 text-xs text-gray-600 mb-4">
                      <div class="flex items-center">
                        <iconify-icon icon="mdi:table" class="mr-2"></iconify-icon>
                        {{ table.columns }} 列，{{ table.rows }} 行
                      </div>
                      <div class="flex items-center">
                        <iconify-icon icon="mdi:database" class="mr-2"></iconify-icon>
                        所有者：{{ table.owner }}
                      </div>
                    </div>
                    <button @click="openPermissionRequestDirect(table.id)"
                            class="w-full px-3 py-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-100 text-sm font-medium flex items-center justify-center">
                      <iconify-icon icon="mdi:plus-circle" class="mr-1"></iconify-icon>
                      申请权限
                    </button>
                  </div>
                </div>
                <!-- 空状态 -->
                <div v-if="filteredApplyTables.length === 0" class="flex items-center justify-center py-12">
                  <div class="text-center">
                    <iconify-icon icon="mdi:check-circle" class="text-6xl text-green-300 mx-auto mb-4"></iconify-icon>
                    <h3 class="text-xl font-bold text-gray-600 mb-2">太棒了！</h3>
                    <p class="text-gray-500">您已拥有所有表格的权限</p>
                  </div>
                </div>
              </div>
            </template>
            <!-- 申请历史详情模式 -->
            <template v-else-if="applyPageMode === 'history'">
              <div v-if="selectedApplyHistoryRecord" class="flex-1 overflow-auto p-6">
                <!-- 表格信息 -->
                <div class="mb-8 pb-6 border-b border-gray-200">
                  <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ selectedApplyHistoryRecord.tableName }}</h2>
                  <p class="text-gray-600 mb-4">{{ tables.find(t => t.id === selectedApplyHistoryRecord.tableId)?.description }}</p>
                  <div class="grid grid-cols-3 gap-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <p class="text-xs text-gray-600 font-medium">申请权限</p>
                      <p class="text-lg font-bold text-gray-900 mt-1">{{ selectedApplyHistoryRecord.type === 'view' ? '只读' : '编辑' }}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <p class="text-xs text-gray-600 font-medium">提交时间</p>
                      <p class="text-lg font-bold text-gray-900 mt-1">{{ selectedApplyHistoryRecord.submitTime }}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <p class="text-xs text-gray-600 font-medium">审核状态</p>
                      <p :class="['text-lg font-bold mt-1',
                        selectedApplyHistoryRecord.status === 'approved' ? 'text-green-600' :
                        selectedApplyHistoryRecord.status === 'rejected' ? 'text-red-600' :
                        'text-yellow-600']">
                        {{ selectedApplyHistoryRecord.status === 'approved' ? '已批准' : selectedApplyHistoryRecord.status === 'rejected' ? '已拒绝' : '待审核' }}
                      </p>
                    </div>
                  </div>
                </div>
                <!-- 申请内容 -->
                <div class="mb-8 pb-6 border-b border-gray-200">
                  <h3 class="text-lg font-bold text-gray-900 mb-3">申请内容</h3>
                  <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p class="text-gray-700 whitespace-pre-wrap">{{ selectedApplyHistoryRecord.reason }}</p>
                  </div>
                </div>
                <!-- 申请人信息 -->
                <div class="mb-8 pb-6 border-b border-gray-200">
                  <h3 class="text-lg font-bold text-gray-900 mb-3">申请人信息</h3>
                  <div class="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <div class="flex items-center space-x-4">
                      <div class="bg-indigo-200 border-2 border-indigo-400 rounded-full w-12 h-12"></div>
                      <div>
                        <p class="font-bold text-gray-900">李明（您）</p>
                        <p class="text-sm text-gray-600">产品部 - 产品经理</p>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 审核信息 -->
                <div>
                  <h3 class="text-lg font-bold text-gray-900 mb-3">审核信息</h3>
                  <!-- 审核人 -->
                  <div v-if="selectedApplyHistoryRecord.reviewer" class="mb-4">
                    <p class="text-sm font-medium text-gray-700 mb-2">审核人</p>
                    <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <div class="flex items-center space-x-4">
                        <div class="bg-blue-200 border-2 border-blue-400 rounded-full w-12 h-12"></div>
                        <div>
                          <p class="font-bold text-gray-900">{{ selectedApplyHistoryRecord.reviewer.name }}</p>
                          <p class="text-sm text-gray-600">{{ selectedApplyHistoryRecord.reviewer.department }} - {{ selectedApplyHistoryRecord.reviewer.position }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 审核意见 -->
                  <div v-if="selectedApplyHistoryRecord.status !== 'pending'">
                    <p class="text-sm font-medium text-gray-700 mb-2">审核意见</p>
                    <div :class="['p-4 rounded-lg border-l-4',
                      selectedApplyHistoryRecord.status === 'approved'
                        ? 'bg-green-50 border-l-green-600 border border-green-200'
                        : 'bg-red-50 border-l-red-600 border border-red-200']">
                      <p class="text-gray-700 whitespace-pre-wrap">{{ selectedApplyHistoryRecord.reviewerComment }}</p>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">审核时间：{{ selectedApplyHistoryRecord.reviewTime }}</p>
                  </div>
                  <!-- 等待审核 -->
                  <div v-else class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p class="text-yellow-800">
                      <iconify-icon icon="mdi:clock-outline" class="inline mr-2"></iconify-icon>
                      您的申请正在审核中，请耐心等待审核结果
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="flex items-center justify-center py-12 flex-1">
                <div class="text-center">
                  <iconify-icon icon="mdi:folder-open" class="text-6xl text-gray-300 mx-auto mb-4"></iconify-icon>
                  <h3 class="text-xl font-bold text-gray-600 mb-2">选择一条申请记录</h3>
                  <p class="text-gray-500">点击左侧申请历史查看详情</p>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
      <!-- 数据同步页面 (Pull Request风格) -->
      <template v-if="currentPage === 'dataSync'">
        <!-- 左侧：PR列表 -->
        <div class="w-80 bg-white rounded-xl shadow flex flex-col">
          <div class="border-b border-gray-200 p-4">
            <h2 class="text-lg font-bold text-gray-900">编辑请求</h2>
            <p class="text-xs text-gray-600 mt-1">共 {{ pullRequests.length }} 个请求</p>
          </div>
          <!-- 搜索和筛选 -->
          <div class="border-b border-gray-200 p-4 space-y-3">
            <div class="relative">
              <input v-model="prSearchQuery" type="text" placeholder="搜索PR..."
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
              <iconify-icon icon="mdi:magnify" class="absolute right-3 top-2.5 text-gray-500"></iconify-icon>
            </div>
            <div class="flex gap-2">
              <button @click="prStatusFilter = null"
                      :class="['px-3 py-1 rounded-full text-xs font-medium transition',
                  prStatusFilter === null
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200']">
                全部
              </button>
              <button @click="prStatusFilter = 'pending'"
                      :class="['px-3 py-1 rounded-full text-xs font-medium transition',
                  prStatusFilter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200']">
                待审批
              </button>
              <button @click="prStatusFilter = 'merged'"
                      :class="['px-3 py-1 rounded-full text-xs font-medium transition',
                  prStatusFilter === 'merged'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200']">
                已合并
              </button>
              <button @click="prStatusFilter = 'rejected'"
                      :class="['px-3 py-1 rounded-full text-xs font-medium transition',
                  prStatusFilter === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200']">
                已拒绝
              </button>
            </div>
          </div>
          <!-- PR列表 -->
          <div class="flex-1 overflow-y-auto">
            <div class="space-y-2 p-3">
              <div v-if="filteredPullRequests.length === 0" class="p-4 text-center text-gray-500 text-sm">
                暂无编辑请求
              </div>
              <div v-for="pr in filteredPullRequests" :key="pr.id"
                   :class="['p-4 rounded-lg border-l-4 transition hover:shadow-md cursor-pointer',
                  selectedPRId === pr.id
                    ? 'border-l-indigo-600 bg-indigo-50 border border-indigo-200'
                    : 'border-l-gray-300 bg-white border border-gray-200 hover:border-gray-300']"
                   @click="selectedPRId = pr.id">
                <div class="flex items-start justify-between mb-2">
                  <h3 class="font-medium text-gray-900 text-sm">{{ pr.tableName }}</h3>
                  <span :class="['px-2 py-0.5 rounded text-xs font-medium',
                    pr.status === 'merged' ? 'bg-green-100 text-green-800' :
                    pr.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    pr.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800']">
                    {{ pr.status === 'merged' ? '已合并' : pr.status === 'pending' ? '待审批' : pr.status === 'rejected' ? '已拒绝' : '已关闭' }}
                  </span>
                </div>
                <p class="text-xs text-gray-600 mb-2 line-clamp-2">{{ pr.description }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500">提交人: {{ pr.submitter }}</span>
                  <span class="text-xs text-gray-500">{{ formatDate(pr.submitTime) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 右侧：PR详情和diff -->
        <div class="flex-1 flex flex-col">
          <div v-if="selectedPRId !== null && selectedPR" class="bg-white rounded-xl shadow flex flex-col overflow-hidden h-full">
            <!-- 头部信息 -->
            <div class="border-b border-gray-200 p-6">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h2 class="text-2xl font-bold text-gray-900">{{ selectedPR.tableName }}</h2>
                  <p class="text-sm text-gray-600 mt-2">编辑请求 #{{ selectedPR.id }}</p>
                </div>
                <span :class="['px-3 py-1.5 rounded-full font-medium text-sm',
                  selectedPR.status === 'merged' ? 'bg-green-100 text-green-800' :
                  selectedPR.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedPR.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800']">
                  {{ selectedPR.status === 'merged' ? '已合并' : selectedPR.status === 'pending' ? '待审批' : selectedPR.status === 'rejected' ? '已拒绝' : '已关闭' }}
                </span>
              </div>
              <div class="flex items-center space-x-6 text-sm">
                <div>
                  <p class="text-gray-600">提交人</p>
                  <p class="font-medium text-gray-900">{{ selectedPR.submitter }}</p>
                </div>
                <div>
                  <p class="text-gray-600">提交时间</p>
                  <p class="font-medium text-gray-900">{{ selectedPR.submitTime }}</p>
                </div>
                <div>
                  <p class="text-gray-600">变更数</p>
                  <p class="font-medium text-gray-900">{{ selectedPR.changes.length }} 项</p>
                </div>
              </div>
            </div>
            <!-- 内容区 -->
            <div class="flex-1 overflow-auto p-6">
              <div class="space-y-6">
                <!-- 概述 -->
                <div>
                  <h3 class="text-lg font-bold text-gray-900 mb-3">变更说明</h3>
                  <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p class="text-gray-700 whitespace-pre-wrap">{{ selectedPR.description }}</p>
                  </div>
                </div>
                <!-- 变更详情 -->
                <div>
                  <h3 class="text-lg font-bold text-gray-900 mb-3">变更详情</h3>
                  <div class="space-y-3">
                    <div v-for="(change, index) in selectedPR.changes" :key="index"
                         class="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                          <span v-if="change.type === 'modify'"
                                class="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            修改
                          </span>
                          <span v-else-if="change.type === 'add'"
                                class="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                            新增
                          </span>
                          <span v-else
                                class="inline-block px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded">
                            删除
                          </span>
                          <span class="text-sm text-gray-600">
                            <strong>{{ change.column }}</strong>
                            <span v-if="change.type === 'modify'"> (第 {{ change.rowIdx + 1 }} 行)</span>
                          </span>
                        </div>
                      </div>
                      <div v-if="change.type === 'modify'" class="flex items-center space-x-4 text-sm">
                        <div class="flex-1">
                          <p class="text-gray-600 text-xs mb-1">原值</p>
                          <div class="bg-red-50 border border-red-200 rounded px-3 py-2 text-gray-900 font-mono text-sm">
                            {{ change.oldValue || '(空)' }}
                          </div>
                        </div>
                        <iconify-icon icon="mdi:arrow-right" class="text-gray-400 text-xl"></iconify-icon>
                        <div class="flex-1">
                          <p class="text-gray-600 text-xs mb-1">新值</p>
                          <div class="bg-green-50 border border-green-200 rounded px-3 py-2 text-gray-900 font-mono text-sm">
                            {{ change.newValue || '(空)' }}
                          </div>
                        </div>
                      </div>
                      <div v-else-if="change.type === 'add'" class="text-sm">
                        <p class="text-gray-600 text-xs mb-1">新增内容</p>
                        <div class="bg-green-50 border border-green-200 rounded px-3 py-2 text-gray-900 font-mono">
                          {{ change.newValue || '(新行)' }}
                        </div>
                      </div>
                      <div v-else class="text-sm">
                        <p class="text-gray-600 text-xs mb-1">删除内容</p>
                        <div class="bg-red-50 border border-red-200 rounded px-3 py-2 text-gray-900 font-mono">
                          {{ change.oldValue || '(整行)' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 底部操作按钮 -->
            <div v-if="selectedPR.status === 'pending'" class="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
              <button @click="mergePullRequest"
                      class="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition flex items-center justify-center space-x-2">
                <iconify-icon icon="mdi:check" class="text-xl"></iconify-icon>
                <span>合并</span>
              </button>
              <button @click="rejectPullRequest"
                      class="flex-1 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition flex items-center justify-center space-x-2">
                <iconify-icon icon="mdi:close" class="text-xl"></iconify-icon>
                <span>拒绝</span>
              </button>
            </div>
          </div>
          <!-- 未选择PR的提示 -->
          <div v-else class="bg-white rounded-xl shadow flex-1 flex items-center justify-center">
            <div class="text-center">
              <iconify-icon icon="mdi:git-branch" class="text-6xl text-gray-300 mx-auto mb-4"></iconify-icon>
              <h3 class="text-xl font-bold text-gray-600 mb-2">请选择一个编辑请求</h3>
              <p class="text-gray-500">从左侧列表选择请求，查看详细的变更信息</p>
            </div>
          </div>
        </div>
      </template>
    </div>
    <!-- 同步详情弹窗 -->
    <div v-if="showSyncModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl shadow-2xl w-11/12 max-w-3xl max-h-[80vh] flex flex-col">
        <!-- 头部 -->
        <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <h2 class="text-2xl font-bold">同步详情</h2>
          <button @click="showSyncModal = false" class="text-white hover:bg-indigo-800 rounded-full p-2">
            <iconify-icon icon="mdi:close" class="text-2xl"></iconify-icon>
          </button>
        </div>
        <!-- 搜索 -->
        <div class="border-b border-gray-200 p-6">
          <div class="relative">
            <input v-model="syncSearchQuery" type="text" placeholder="搜索表格..."
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            <iconify-icon icon="mdi:magnify" class="absolute right-3 top-2.5 text-gray-500"></iconify-icon>
          </div>
        </div>
        <!-- 内容 -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- 已获得权限 -->
          <div class="mb-8">
            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <iconify-icon icon="mdi:check-circle" class="text-green-600 mr-2 text-xl"></iconify-icon>
              已获得权限
            </h3>
            <div class="space-y-3">
              <div v-for="perm in filteredPermissions" :key="perm.id"
                   class="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p class="font-medium text-gray-900">{{ perm.table }}</p>
                  <p class="text-sm text-gray-600 mt-1">{{ perm.permission }}</p>
                </div>
                <span class="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                  {{ perm.level }}
                </span>
              </div>
            </div>
          </div>
          <!-- 已合并的提交 -->
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <iconify-icon icon="mdi:git-merge" class="text-blue-600 mr-2 text-xl"></iconify-icon>
              已合并的提交
            </h3>
            <div class="space-y-3">
              <div v-for="pr in filteredPRs" :key="pr.id"
                   class="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p class="font-medium text-gray-900">{{ pr.title }}</p>
                  <p class="text-sm text-gray-600 mt-1">{{ pr.description }}</p>
                  <p class="text-xs text-gray-500 mt-2">by {{ pr.author }} • {{ pr.time }}</p>
                </div>
                <span class="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">
                  已合并
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 表格选择弹窗（用于申请权限） -->
    <div v-if="showTableSelectModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <!-- 头部 -->
        <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <h2 class="text-2xl font-bold">选择要申请的表格</h2>
          <button @click="showTableSelectModal = false" class="text-white hover:bg-indigo-800 rounded-full p-2">
            <iconify-icon icon="mdi:close" class="text-2xl"></iconify-icon>
          </button>
        </div>
        <!-- 搜索 -->
        <div class="border-b border-gray-200 p-6">
          <div class="relative">
            <input v-model="tableSelectSearchQuery" type="text" placeholder="搜索表格..."
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            <iconify-icon icon="mdi:magnify" class="absolute right-3 top-2.5 text-gray-500"></iconify-icon>
          </div>
        </div>
        <!-- 表格列表 -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-1 gap-4">
            <div v-for="table in filteredSelectTables" :key="table.id"
                 class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-indigo-300 transition">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{{ table.name }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ table.description }}</p>
                <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>{{ table.columns }} 列</span>
                  <span>{{ table.rows }} 行</span>
                  <span>拥有者: {{ table.owner }}</span>
                </div>
              </div>
              <button @click="selectTableForPermission(table.id)"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium ml-4">
                申请
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 权限申请弹窗 -->
    <div v-if="showPermissionModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <h2 class="text-2xl font-bold text-gray-900 px-8 py-6 border-b border-gray-200">申请表格访问权限</h2>
        <div class="flex-1 overflow-y-auto p-8">
          <div class="space-y-6">
            <!-- 申请表格 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">申请表格</label>
              <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p class="text-lg font-bold text-gray-900">{{ requestingTableName }}</p>
                <p class="text-sm text-gray-600 mt-1">{{ requestingTableDesc }}</p>
              </div>
            </div>
            <!-- 申请权限类型 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">申请权限 <span class="text-red-500">*</span></label>
              <div class="space-y-2">
                <label class="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input v-model="permissionRequest.type" type="radio" value="view" class="w-4 h-4" />
                  <span class="ml-3 text-gray-700">只读权限</span>
                </label>
                <label class="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input v-model="permissionRequest.type" type="radio" value="edit" class="w-4 h-4" />
                  <span class="ml-3 text-gray-700">编辑权限</span>
                </label>
              </div>
            </div>
            <!-- 选择列 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                选择需要访问的列 <span class="text-red-500">*</span>
                <span class="text-xs text-gray-500 font-normal">
                  ({{ permissionRequest.selectedColumns?.length || 0 }}/{{ requestingTableColumns?.length || 0 }})
                </span>
              </label>
              <div class="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                <div class="space-y-2">
                  <!-- 全选选项 -->
                  <label class="flex items-center p-2 hover:bg-white rounded cursor-pointer">
                    <input type="checkbox"
                           :checked="permissionRequest.selectedColumns?.length === requestingTableColumns?.length && requestingTableColumns?.length > 0"
                           @change="toggleAllColumns"
                           class="w-4 h-4 rounded" />
                    <span class="ml-2 text-sm font-medium text-gray-900">全选</span>
                  </label>
                  <!-- 列选项 -->
                  <div v-for="col in requestingTableColumns" :key="col" class="flex items-center p-2 hover:bg-white rounded cursor-pointer">
                    <input type="checkbox"
                           :checked="permissionRequest.selectedColumns?.includes(col)"
                           @change="(e) => toggleColumn(col, e.target.checked)"
                           class="w-4 h-4 rounded" />
                    <span class="ml-2 text-sm text-gray-700">{{ col }}</span>
                  </div>
                </div>
              </div>
              <p v-if="!permissionRequest.selectedColumns?.length" class="text-xs text-red-500 mt-1">请至少选择一个列</p>
            </div>
            <!-- 选择审核人 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选择审核人 <span class="text-red-500">*</span></label>
              <div class="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                <!-- 所有者 -->
                <div v-for="reviewer in availableReviewers" :key="reviewer.id"
                     class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input v-model="permissionRequest.reviewerId" type="radio" :value="reviewer.id" class="w-4 h-4" />
                  <div class="ml-3 flex-1">
                    <p class="font-medium text-gray-900">{{ reviewer.name }}</p>
                    <p class="text-xs text-gray-600">{{ reviewer.department }} - {{ reviewer.position }}</p>
                  </div>
                </div>
              </div>
            </div>
            <!-- 申请原因 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">申请原因 <span class="text-red-500">*</span></label>
              <textarea v-model="permissionRequest.reason" placeholder="请说明为什么需要该权限..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                        rows="4"></textarea>
            </div>
          </div>
        </div>
        <!-- 底部按钮 -->
        <div class="border-t border-gray-200 px-8 py-4 flex gap-3 bg-gray-50">
          <button @click="closePermissionModal"
                  class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium">
            取消
          </button>
          <button @click="submitPermissionRequest"
                  class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
            提交申请
          </button>
        </div>
      </div>
    </div>
    <!-- 表格详情弹窗 -->
    <TableDetail v-if="showTableDetailModal"
                 :tableId="detailTableId"
                 :tableData="detailTable"
                 @close="showTableDetailModal = false" />
    <!-- 表格被修改通知 (右上角) -->
    <div v-if="showUpdateNotification" class="fixed top-24 right-4 w-96 bg-white rounded-lg shadow-lg border-l-4 border-l-orange-500 p-4 z-50 animate-slide-in">
      <div class="flex items-start space-x-4">
        <div class="bg-orange-100 rounded-full p-3 flex-shrink-0">
          <iconify-icon icon="mdi:pencil-outline" class="text-2xl text-orange-600"></iconify-icon>
        </div>
        <div class="flex-1">
          <h3 class="font-bold text-gray-900">表格已更新</h3>
          <p class="text-sm text-gray-600 mt-1">{{ updateNotificationTable?.name }}</p>
          <p class="text-sm text-gray-700 mt-2">
            新增 <span class="font-bold text-orange-600">{{ updateNotificationTable?.updateCount || 1 }}</span> 个字段，
            修改 <span class="font-bold text-orange-600">{{ updateNotificationTable?.modifyCount || 2 }}</span> 个字段
          </p>
        </div>
        <button @click="closeUpdateNotification" class="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <iconify-icon icon="mdi:close" class="text-xl"></iconify-icon>
        </button>
      </div>
    </div>
    <!-- 获得权限通知 (右上角) -->
    <div v-if="showPermissionNotification" class="fixed top-24 right-4 w-96 bg-white rounded-lg shadow-lg border-l-4 border-l-green-500 p-4 z-50 animate-slide-in">
      <div class="flex items-start space-x-4">
        <div class="bg-green-100 rounded-full p-3 flex-shrink-0">
          <iconify-icon icon="mdi:check-circle-outline" class="text-2xl text-green-600"></iconify-icon>
        </div>
        <div class="flex-1">
          <h3 class="font-bold text-gray-900">权限已批准</h3>
          <p class="text-sm text-gray-600 mt-1">{{ permissionNotificationTable?.name }}</p>
          <p class="text-sm text-gray-700 mt-2">
            您的 <span class="font-bold text-green-600">{{ permissionNotificationData?.type === 'edit' ? '编辑' : '查看' }}</span>
            权限已被批准
          </p>
          <p class="text-xs text-gray-500 mt-2">批准人：{{ permissionNotificationData?.approver }}</p>
        </div>
        <button @click="closePermissionNotification" class="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <iconify-icon icon="mdi:close" class="text-xl"></iconify-icon>
        </button>
      </div>
    </div>
    <!-- 表格编辑提交审核弹窗 -->
    <div v-if="showSubmitReviewModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
        <h2 class="text-2xl font-bold text-gray-900 px-8 py-6 border-b border-gray-200">提交表格修改审核</h2>
        <div class="flex-1 overflow-y-auto p-8">
          <div class="space-y-6">
            <!-- 表格信息 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">表格名称</label>
              <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p class="text-lg font-bold text-gray-900">{{ selectedTable?.name }}</p>
              </div>
            </div>
            <!-- 修改摘要 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">修改摘要</label>
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div class="space-y-2 text-sm text-gray-700">
                  <p v-if="changedRows.length > 0" class="font-medium text-yellow-900">修改了 {{ changedRows.length }} 行数据：</p>
                  <div v-for="(rowIdx) in changedRows.slice(0, 10)" :key="rowIdx"
                       class="p-2 bg-white border border-yellow-100 rounded">
                    <p class="font-medium text-gray-900">第 {{ rowIdx + 1 }} 行</p>
                    <p class="text-xs text-gray-600 mt-1">
                      <span v-for="(col, idx) in selectedTable?.allColumns" :key="col">
                        <span v-if="editingTableData[`${rowIdx}-${col}`] !== undefined">
                          <span v-if="idx > 0">, </span>
                          {{ col }}:
                          <span class="line-through text-red-600">{{ getTableData(selectedTableId)[rowIdx][col] }}</span>
                          →
                          <span class="text-green-600">{{ editingTableData[`${rowIdx}-${col}`] }}</span>
                        </span>
                      </span>
                    </p>
                  </div>
                  <p v-if="changedRows.length > 10" class="text-xs text-gray-600 mt-2">... 及其他 {{ changedRows.length - 10 }} 行</p>
                </div>
              </div>
            </div>
            <!-- 修改说明 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">修改说明 <span class="text-red-500">*</span></label>
              <textarea v-model="tableEditReviewRequest.description"
                        placeholder="请简要说明本次修改的原因和内容..."
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
              ></textarea>
              <p v-if="!tableEditReviewRequest.description" class="text-xs text-red-500 mt-1">请输入修改说明</p>
            </div>
            <!-- 选择审核人 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选择审核人 <span class="text-red-500">*</span></label>
              <div class="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                <!-- 所有者 -->
                <label class="flex items-start p-3 hover:bg-white rounded cursor-pointer transition">
                  <input type="radio" v-model="tableEditReviewRequest.reviewerId" :value="selectedTable?.owner"
                         class="w-4 h-4 mt-0.5" />
                  <div class="ml-3 flex-1">
                    <p class="font-medium text-gray-900">{{ selectedTable?.owner }}</p>
                    <p class="text-xs text-gray-600">
                      <span class="inline-block">{{ selectedTable?.ownerDept }}</span>
                      <span class="inline-block ml-2">{{ selectedTable?.ownerPosition }}</span>
                    </p>
                  </div>
                </label>
                <!-- 管理员 -->
                <div v-for="admin in selectedTable?.admins" :key="admin.id">
                  <label class="flex items-start p-3 hover:bg-white rounded cursor-pointer transition">
                    <input type="radio" v-model="tableEditReviewRequest.reviewerId" :value="admin.name"
                           class="w-4 h-4 mt-0.5" />
                    <div class="ml-3 flex-1">
                      <p class="font-medium text-gray-900">{{ admin.name }}</p>
                      <p class="text-xs text-gray-600">
                        <span class="inline-block">{{ admin.department }}</span>
                        <span class="inline-block ml-2">{{ admin.position }}</span>
                      </p>
                    </div>
                  </label>
                </div>
              </div>
              <p v-if="!tableEditReviewRequest.reviewerId" class="text-xs text-red-500 mt-1">请选择审核人</p>
            </div>
          </div>
        </div>
        <!-- 底部按钮 -->
        <div class="border-t border-gray-200 px-8 py-4 flex items-center justify-end space-x-3 bg-gray-50">
          <button @click="showSubmitReviewModal = false"
                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition">
            取消
          </button>
          <button @click="submitReviewRequest"
                  :disabled="!tableEditReviewRequest.description || !tableEditReviewRequest.reviewerId"
                  :class="['px-4 py-2 rounded-lg flex items-center space-x-2 font-medium transition',
              !tableEditReviewRequest.description || !tableEditReviewRequest.reviewerId
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700']">
            <iconify-icon icon="mdi:send" class="text-lg"></iconify-icon>
            <span>提交审核</span>
          </button>
        </div>
      </div>
    </div>
    <!-- 通知消息 -->
    <div v-if="notifications.length > 0" class="fixed bottom-4 right-4 space-y-2 z-40">
      <transition-group name="slide-fade">
        <div v-for="notif in notifications" :key="notif.id"
             :class="['px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 text-white animate-pulse',
            notif.type === 'success' ? 'bg-green-500' :
            notif.type === 'error' ? 'bg-red-500' :
            'bg-blue-500']">
          <iconify-icon
              :icon="notif.type === 'success' ? 'mdi:check-circle' :
                    notif.type === 'error' ? 'mdi:alert-circle' :
                    'mdi:information-outline'"
              class="text-xl"></iconify-icon>
          <span class="font-medium">{{ notif.message }}</span>
        </div>
      </transition-group>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import TableDetail from './TableDetail.vue'
const currentPage = ref('workspace')
const searchQuery = ref('')
const syncSearchQuery = ref('')
const tableSelectSearchQuery = ref('')
const applySearchQuery = ref('')
const selectedTableId = ref(null)
const selectedApplyHistoryId = ref(null)
const requestingTableId = ref(null)
const detailTableId = ref(null)
const applyPageMode = ref('list')
const isSyncing = ref(false)
const notifications = ref([])
const showSyncModal = ref(false)
const showPermissionModal = ref(false)
const showTableSelectModal = ref(false)
const showTableDetailModal = ref(false)
const showUpdateNotification = ref(false)
const showPermissionNotification = ref(false)
const isEditingTable = ref(false)
const editingTableData = ref({})
const changedRows = ref([])
const showSubmitReviewModal = ref(false)
const tableEditReviewRequest = ref({
  description: '',
  reviewerId: null,
  changesSummary: ''
})
// 数据同步相关状态
const selectedPRId = ref(null)
const prSearchQuery = ref('')
const prStatusFilter = ref(null)
const updateNotificationTable = ref(null)
const permissionNotificationTable = ref(null)
const permissionNotificationData = ref({
  type: 'view',
  approver: '郑总'
})
const permissionRequest = ref({
  type: 'view',
  reason: '',
  reviewerId: null,
  selectedColumns: []
})
const tables = ref([
  {
    id: 1,
    name: '项目信息表',
    description: '公司所有项目的基本信息和状态',
    columns: 8,
    rows: 24,
    owner: '张工',
    ownerDept: '技术部',
    ownerPosition: '技术总监',
    admins: [
      { id: 1, name: '王经理', department: '项目部', position: '项目经理' },
      { id: 2, name: '李主管', department: '技术部', position: '部门主管' }
    ],
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
    description: '员工月度绩效评分和反馈',
    columns: 6,
    rows: 156,
    owner: '王经理',
    ownerDept: '人力资源部',
    ownerPosition: 'HR经理',
    admins: [
      { id: 3, name: '张工', department: '技术部', position: '技术总监' }
    ],
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
    description: '部门预算和支出追踪',
    columns: 7,
    rows: 12,
    owner: '李财务',
    ownerDept: '财务部',
    ownerPosition: '财务部长',
    admins: [
      { id: 4, name: '郑总', department: '财务部', position: '财务总监' },
      { id: 5, name: '刘审计', department: '审计部', position: '审计主管' }
    ],
    myAccessLevel: null,
    allColumns: ['部门', '预算总额', '已支出', '预留', '年份', '审批状态', '负责人'],
    versionHistory: []
  },
  {
    id: 4,
    name: '客户管理表',
    description: '客户信息和合作状态',
    columns: 9,
    rows: 342,
    owner: '销售部',
    ownerDept: '销售部',
    ownerPosition: '销售总监',
    admins: [
      { id: 6, name: '陈经理', department: '销售部', position: '大区经理' },
      { id: 7, name: '关主任', department: '销售支持', position: '数据主任' }
    ],
    myAccessLevel: 'edit',
    allColumns: ['客户ID', '客户名称', '行业', '联系电话', '地址', '合作状态', '合同金额', '业务负责人', '最后联系时间'],
    versionHistory: [
      { message: '更新客户分类方案', type: 'update', author: '销售部', timestamp: '2025-12-05 13:20', details: '根据合作规模重新分类客户等级' },
      { message: '初始化客户数据库', type: 'add', author: '李技术', timestamp: '2025-11-01 10:00', details: '导入企业ERP系统的客户信息' }
    ]
  }
])
// Pull Request 数据（数据同步）
const pullRequests = ref([
  {
    id: 1,
    tableId: 1,
    tableName: '项目信息表',
    description: '更新项目P001的预算信息\n- 预算调整为550000\n- 实际支出更新为380000',
    submitter: '张工',
    submitTime: '2025-12-08 10:30',
    status: 'pending',
    changes: [
      {
        type: 'modify',
        rowIdx: 0,
        column: '预算',
        oldValue: '500000',
        newValue: '550000'
      },
      {
        type: 'modify',
        rowIdx: 0,
        column: '实际支出',
        oldValue: '320000',
        newValue: '380000'
      }
    ]
  },
  {
    id: 2,
    tableId: 1,
    tableName: '项目信息表',
    description: '项目P002状态更新为已完成\n- 完成时间提前到2025-06-30\n- 实际支出最终数据为750000',
    submitter: '李技术',
    submitTime: '2025-12-07 15:45',
    status: 'merged',
    changes: [
      {
        type: 'modify',
        rowIdx: 1,
        column: '状态',
        oldValue: '进行中',
        newValue: '已完成'
      },
      {
        type: 'modify',
        rowIdx: 1,
        column: '实际支出',
        oldValue: '450000',
        newValue: '750000'
      }
    ]
  },
  {
    id: 3,
    tableId: 2,
    tableName: '员工绩效表',
    description: '张工11月绩效评分修正\n- 原评分95，调整为96\n- 备注更新为杰出表现',
    submitter: '王经理',
    submitTime: '2025-12-06 14:20',
    status: 'pending',
    changes: [
      {
        type: 'modify',
        rowIdx: 0,
        column: '绩效评分',
        oldValue: '95',
        newValue: '96'
      },
      {
        type: 'modify',
        rowIdx: 0,
        column: '备注',
        oldValue: '表现优秀',
        newValue: '杰出表现'
      }
    ]
  },
  {
    id: 4,
    tableId: 3,
    tableName: '财务预算表',
    description: '技术部预算调整\n- 预算总额增加到2200000\n- 已支出更新为1300000',
    submitter: '郑总',
    submitTime: '2025-12-05 11:00',
    status: 'merged',
    changes: [
      {
        type: 'modify',
        rowIdx: 0,
        column: '预算总额',
        oldValue: '2000000',
        newValue: '2200000'
      },
      {
        type: 'modify',
        rowIdx: 0,
        column: '已支出',
        oldValue: '1200000',
        newValue: '1300000'
      }
    ]
  },
  {
    id: 5,
    tableId: 4,
    tableName: '客户管理表',
    description: '新增阿里巴巴合作项目\n- 合同金额：2000000\n- 业务负责人：李销售',
    submitter: '陈经理',
    submitTime: '2025-12-04 09:15',
    status: 'rejected',
    changes: [
      {
        type: 'add',
        rowIdx: 3,
        column: '客户ID',
        newValue: 'C004'
      },
      {
        type: 'add',
        rowIdx: 3,
        column: '客户名称',
        newValue: '阿里巴巴'
      },
      {
        type: 'add',
        rowIdx: 3,
        column: '合同金额',
        newValue: '2000000'
      }
    ]
  }
])
const selectedTable = computed(() => tables.value.find(t => t.id === selectedTableId.value))
const requestingTableName = computed(() => {
  const table = tables.value.find(t => t.id === requestingTableId.value)
  return table?.name || ''
})
const accessTables = computed(() => {
  return tables.value.filter(t => t.myAccessLevel !== null)
})
const noAccessTables = computed(() => {
  return tables.value.filter(t => t.myAccessLevel === null)
})
const filteredTables = computed(() => {
  if (!searchQuery.value) return tables.value
  return tables.value.filter(t =>
      t.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
// 同步弹窗中的权限数据
const syncPermissions = ref([
  { id: 1, table: '项目信息表', permission: '获得编辑权限', level: '编辑' },
  { id: 2, table: '员工绩效表', permission: '获得查看权限', level: '只读' },
  { id: 3, table: '客户管理表', permission: '获得编辑权限', level: '编辑' }
])
// 同步弹窗中的PR数据
const syncPRs = ref([
  { id: 1, title: '项目信息表 - 添加预算审批字段', description: '新增预算审批状态以支持多级审批', author: '张工', time: '2025-12-08 14:30' },
  { id: 2, title: '员工绩效表 - 新增部门排名', description: '用于部门内绩效对比', author: '王经理', time: '2025-12-06 16:45' },
  { id: 3, title: '客户管理表 - 更新客户分类', description: '根据合作规模重新分类', author: '销售部', time: '2025-12-05 13:20' }
])
const filteredPermissions = computed(() => {
  if (!syncSearchQuery.value) return syncPermissions.value
  return syncPermissions.value.filter(p =>
      p.table.toLowerCase().includes(syncSearchQuery.value.toLowerCase())
  )
})
const filteredPRs = computed(() => {
  if (!syncSearchQuery.value) return syncPRs.value
  return syncPRs.value.filter(pr =>
      pr.title.toLowerCase().includes(syncSearchQuery.value.toLowerCase())
  )
})
const filteredSelectTables = computed(() => {
  // 只显示无权限或待申请的表格
  const noAccessTables = tables.value.filter(t => !t.myAccessLevel)
  if (!tableSelectSearchQuery.value) return noAccessTables
  return noAccessTables.filter(t =>
      t.name.toLowerCase().includes(tableSelectSearchQuery.value.toLowerCase()) ||
      t.description.toLowerCase().includes(tableSelectSearchQuery.value.toLowerCase())
  )
})
// 权限申请历史
const permissionHistory = ref([
  {
    id: 1,
    tableId: 3,
    tableName: '财务预算表',
    type: 'view',
    reason: '需要查看部门预算情况用于项目成本评估',
    submitTime: '2025-12-07 14:30',
    status: 'pending',
    reviewer: null,
    reviewerComment: null,
    reviewTime: null
  },
  {
    id: 2,
    tableId: 3,
    tableName: '财务预算表',
    type: 'edit',
    reason: '需要编辑权限以便调整预算分配',
    submitTime: '2025-12-05 09:15',
    status: 'rejected',
    reviewer: {
      id: 4,
      name: '郑总',
      department: '财务部',
      position: '财务总监'
    },
    reviewerComment: '目前编辑权限只允许财务部内部人员获取，建议先通过查看权限了解业务需求，三个月后再申请编辑权限',
    reviewTime: '2025-12-05 15:45'
  },
  {
    id: 3,
    tableId: 3,
    tableName: '财务预算表',
    type: 'view',
    reason: '支持项目预算追踪和成本管理',
    submitTime: '2025-12-01 10:20',
    status: 'approved',
    reviewer: {
      id: 4,
      name: '郑总',
      department: '财务部',
      position: '财务总监'
    },
    reviewerComment: '已批准。查看权限可以访问所有财务预算数据，请妥善保管数据安全。',
    reviewTime: '2025-12-01 14:00'
  }
])
const requestingTableDesc = computed(() => {
  const table = tables.value.find(t => t.id === requestingTableId.value)
  return table?.description || ''
})
const requestingTableColumns = computed(() => {
  const table = tables.value.find(t => t.id === requestingTableId.value)
  return table?.allColumns || []
})
// 获取申请表的审核人列表（所有者和管理员）
const availableReviewers = computed(() => {
  if (!requestingTableId.value) return []
  const table = tables.value.find(t => t.id === requestingTableId.value)
  if (!table) return []
  // 所有者作为第一个选项
  const owner = {
    id: `owner-${table.id}`,
    name: table.owner,
    department: table.ownerDept,
    position: table.ownerPosition
  }
  // 合并所有者和管理员
  const admins = (table.admins || []).map(admin => ({
    ...admin,
    id: `admin-${table.id}-${admin.id}`
  }))
  return [owner, ...admins]
})
// 申请页面搜索过滤
const filteredApplyTables = computed(() => {
  const tables_list = noAccessTables.value
  if (!applySearchQuery.value) return tables_list
  return tables_list.filter(t =>
      t.name.toLowerCase().includes(applySearchQuery.value.toLowerCase()) ||
      t.description.toLowerCase().includes(applySearchQuery.value.toLowerCase())
  )
})
// 选中的申请历史详情
const selectedApplyHistoryRecord = computed(() => {
  return permissionHistory.value.find(h => h.id === selectedApplyHistoryId.value)
})
const detailTable = computed(() => tables.value.find(t => t.id === detailTableId.value))
// 数据同步相关计算属性
const pendingPRs = computed(() => {
  return pullRequests.value.filter(pr => pr.status === 'pending')
})

const pendingDataChangeRequests = computed(() => {
  return pendingPRs.value.length
})

const filteredPullRequests = computed(() => {
  let result = pullRequests.value
  // 按搜索词过滤
  if (prSearchQuery.value) {
    const query = prSearchQuery.value.toLowerCase()
    result = result.filter(pr =>
        pr.tableName.toLowerCase().includes(query) ||
        pr.description.toLowerCase().includes(query) ||
        pr.submitter.toLowerCase().includes(query)
    )
  }
  // 按状态过滤
  if (prStatusFilter.value) {
    result = result.filter(pr => pr.status === prStatusFilter.value)
  }
  return result
})

const selectedPR = computed(() => {
  return pullRequests.value.find(pr => pr.id === selectedPRId.value)
})
const tableData = {
  1: [
    { '项目ID': 'P001', '项目名称': '数据平台升级', '负责人': '张工', '开始时间': '2025-01-15', '预期完成时间': '2025-03-31', '状态': '进行中', '预算': '500000', '实际支出': '320000' },
    { '项目ID': 'P002', '项目名称': 'AI助手系统', '负责人': '李技术', '开始时间': '2025-02-01', '预期完成时间': '2025-04-30', '状态': '进行中', '预算': '800000', '实际支出': '180000' }
  ],
  2: [
    { '员工ID': 'E001', '员工名称': '张工', '部门': '技术部', '月份': '2025-12', '绩效评分': '92', '备注': '表现优秀' },
    { '员工ID': 'E002', '员工名称': '王经理', '部门': '项目部', '月份': '2025-12', '绩效评分': '88', '备注': '完成指标' }
  ],
  4: [
    { '客户ID': 'C001', '客户名称': '阿里巴巴', '行业': '科技', '联系电话': '0571-2888', '地址': '杭州', '合作状态': '合作中', '合同金额': '5000000', '业务负责人': '李销售', '最后联系时间': '2025-12-08' },
    { '客户ID': 'C002', '客户名称': '腾讯', '行业': '科技', '联系电话': '0755-8888', '地址': '深圳', '合作状态': '合作中', '合同金额': '8000000', '业务负责人': '王销售', '最后联系时间': '2025-12-07' }
  ]
}
function selectTable(tableId) {
  selectedTableId.value = tableId
}
function getTableData(tableId) {
  return tableData[tableId] || []
}
function openSyncModal() {
  showSyncModal.value = true
  isSyncing.value = true
  setTimeout(() => {
    isSyncing.value = false
    addNotification('权限审核成功', 'success')
    addNotification('数据同步完成', 'success')
  }, 2000)
}
function openPermissionRequest(tableId) {
  // 打开表格选择列表而不是直接打开申请表单
  tableSelectSearchQuery.value = ''
  showTableSelectModal.value = true
}
function openPermissionRequestDirect(tableId) {
  // 从申请权限页面直接打开对应表格的申请表单
  requestingTableId.value = tableId
  permissionRequest.value = { type: 'view', reason: '', reviewerId: null, selectedColumns: [] }
  // 初始化第一个审核人
  const table = tables.value.find(t => t.id === tableId)
  if (table) {
    const owner = {
      id: `owner-${table.id}`,
      name: table.owner,
      department: table.ownerDept,
      position: table.ownerPosition
    }
    permissionRequest.value.reviewerId = owner.id
  }
  showPermissionModal.value = true
}
function selectTableForPermission(tableId) {
  // 从表格列表选择一个表格后，打开权限申请表单
  requestingTableId.value = tableId
  permissionRequest.value = { type: 'view', reason: '', reviewerId: null, selectedColumns: [] }
  // 初始化第一个审核人
  const table = tables.value.find(t => t.id === tableId)
  if (table) {
    const owner = {
      id: `owner-${table.id}`,
      name: table.owner,
      department: table.ownerDept,
      position: table.ownerPosition
    }
    permissionRequest.value.reviewerId = owner.id
  }
  showTableSelectModal.value = false
  showPermissionModal.value = true
}
function closePermissionModal() {
  // 关闭权限申请弹窗
  showPermissionModal.value = false
  requestingTableId.value = null
  permissionRequest.value = { type: 'view', reason: '', reviewerId: null, selectedColumns: [] }
}
function toggleAllColumns(e) {
  if (e.target.checked) {
    // 全选
    permissionRequest.value.selectedColumns = [...requestingTableColumns.value]
  } else {
    // 取消全选
    permissionRequest.value.selectedColumns = []
  }
}
function toggleColumn(col, isChecked) {
  if (isChecked) {
    // 添加列
    if (!permissionRequest.value.selectedColumns.includes(col)) {
      permissionRequest.value.selectedColumns.push(col)
    }
  } else {
    // 移除列
    permissionRequest.value.selectedColumns = permissionRequest.value.selectedColumns.filter(c => c !== col)
  }
}
function submitPermissionRequest() {
  if (!permissionRequest.value.reason) {
    addNotification('请填写申请原因', 'error')
    return
  }
  if (!permissionRequest.value.reviewerId) {
    addNotification('请选择审核人', 'error')
    return
  }
  if (!permissionRequest.value.selectedColumns || permissionRequest.value.selectedColumns.length === 0) {
    addNotification('请至少选择一个列', 'error')
    return
  }
  // 创建新的申请历史记录
  const table = tables.value.find(t => t.id === requestingTableId.value)
  if (table) {
    const now = new Date()
    const submitTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const newRecord = {
      id: Math.max(...permissionHistory.value.map(h => h.id), 0) + 1,
      tableId: requestingTableId.value,
      tableName: table.name,
      type: permissionRequest.value.type,
      reason: permissionRequest.value.reason,
      selectedColumns: [...permissionRequest.value.selectedColumns],
      submitTime: submitTime,
      status: 'pending',
      reviewer: null,
      reviewerComment: null,
      reviewTime: null
    }
    permissionHistory.value.unshift(newRecord)
    // 自动选中新提交的申请
    selectedApplyHistoryId.value = newRecord.id
  }
  addNotification('权限申请已提交，请等待审核', 'info')
  closePermissionModal()
}
function showTableOptions(tableId) {
  // 点击三个点，打开表格详情弹窗
  detailTableId.value = tableId
  showTableDetailModal.value = true
}
function exportTableData(tableId) {
  const table = tables.value.find(t => t.id === tableId)
  if (!table) {
    addNotification('表格不存在', 'error')
    return
  }
  const tableData = getTableData(tableId)
  // 创建 CSV 内容
  let csvContent = '数据导出\n'
  csvContent += `表格名称：${table.name}\n`
  csvContent += `描述：${table.description}\n`
  csvContent += `导出时间：${new Date().toLocaleString('zh-CN')}\n`
  // 添加列标题
  csvContent += table.allColumns.join(',') + '\n'
  // 添加数据行
  tableData.forEach(row => {
    const rowData = table.allColumns.map(col => {
      const value = row[col] || ''
      // 处理包含逗号和引号的值
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    })
    csvContent += rowData.join(',') + '\n'
  })
  // 创建 Blob 并下载
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${table.name}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  addNotification(`已导出 ${table.name} 数据`, 'success')
}
function importTable() {
  addNotification('导入功能开发中...', 'info')
}
function refreshData() {
  if (isSyncing.value) return
  isSyncing.value = true
  // 模拟2秒的数据刷新
  setTimeout(() => {
    isSyncing.value = false
    // 显示刷新成功提示
    showUpdateNotification.value = true
    updateNotificationTable.value = {
      name: '数据已刷新',
      updateCount: 1,
      modifyCount: 0
    }
    setTimeout(() => {
      showUpdateNotification.value = false
    }, 3000)
  }, 2000)
}
function showNotificationDemo(type) {
  if (type === 'update') {
    // 随机选择一个有权限的表格
    const accessTablesList = accessTables.value
    if (accessTablesList.length > 0) {
      const randomTable = accessTablesList[Math.floor(Math.random() * accessTablesList.length)]
      updateNotificationTable.value = {
        name: randomTable.name,
        updateCount: Math.floor(Math.random() * 3) + 1,
        modifyCount: Math.floor(Math.random() * 4) + 1
      }
      showUpdateNotification.value = true
      // 3秒后自动关闭
      setTimeout(() => {
        showUpdateNotification.value = false
      }, 3000)
    }
  } else if (type === 'permission') {
    // 随机选择一个无权限的表格
    const noAccessTablesList = noAccessTables.value
    if (noAccessTablesList.length > 0) {
      const randomTable = noAccessTablesList[Math.floor(Math.random() * noAccessTablesList.length)]
      permissionNotificationTable.value = {
        name: randomTable.name
      }
      permissionNotificationData.value = {
        type: Math.random() > 0.5 ? 'edit' : 'view',
        approver: randomTable.admins && randomTable.admins.length > 0 ? randomTable.admins[0].name : randomTable.owner
      }
      showPermissionNotification.value = true
      // 3秒后自动关闭
      setTimeout(() => {
        showPermissionNotification.value = false
      }, 3000)
    }
  }
}
function closeUpdateNotification() {
  showUpdateNotification.value = false
}
function closePermissionNotification() {
  showPermissionNotification.value = false
}
function startEditingTable() {
  if (selectedTable.value?.myAccessLevel !== 'edit') {
    addNotification('您没有编辑权限', 'error')
    return
  }
  isEditingTable.value = true
  changedRows.value = []
  editingTableData.value = {}
}
function cancelEditingTable() {
  isEditingTable.value = false
  changedRows.value = []
  editingTableData.value = {}
}
function startEditingCell(rowIdx, col) {
  const key = `${rowIdx}-${col}`
  if (editingTableData.value[key] === undefined) {
    const currentValue = getTableData(selectedTableId.value)[rowIdx][col] || ''
    editingTableData.value[key] = currentValue
  }
}
function completeEditingCell(rowIdx, col) {
  const key = `${rowIdx}-${col}`
  const newValue = editingTableData.value[key]
  const oldValue = getTableData(selectedTableId.value)[rowIdx][col]
  // 如果没有实际改变，则删除编辑记录
  if (newValue === oldValue) {
    delete editingTableData.value[key]
    // 检查该行是否还有其他改动
    const hasOtherChanges = Object.keys(editingTableData.value).some(k => k.startsWith(`${rowIdx}-`) && editingTableData.value[k] !== getTableData(selectedTableId.value)[rowIdx][k.split('-')[1]])
    if (!hasOtherChanges) {
      changedRows.value = changedRows.value.filter(r => r !== rowIdx)
    }
  } else {
    // 标记该行为已修改
    if (!changedRows.value.includes(rowIdx)) {
      changedRows.value.push(rowIdx)
    }
  }
}
function cancelEditingCell(rowIdx, col) {
  const key = `${rowIdx}-${col}`
  delete editingTableData.value[key]
  // 检查该行是否还有其他改动
  const hasOtherChanges = Object.keys(editingTableData.value).some(k => k.startsWith(`${rowIdx}-`))
  if (!hasOtherChanges) {
    changedRows.value = changedRows.value.filter(r => r !== rowIdx)
  }
}
function submitTableChangesForReview() {
  if (changedRows.value.length === 0) {
    addNotification('没有修改内容', 'error')
    return
  }
  // 重置审核表单
  tableEditReviewRequest.value = {
    description: '',
    reviewerId: null,
    changesSummary: ''
  }
  showSubmitReviewModal.value = true
}
function submitReviewRequest() {
  if (!tableEditReviewRequest.value.description) {
    addNotification('请填写修改说明', 'error')
    return
  }
  if (!tableEditReviewRequest.value.reviewerId) {
    addNotification('请选择审核人', 'error')
    return
  }
  // 保存修改到表格数据
  const tableData = getTableData(selectedTableId.value)
  for (const [key, newValue] of Object.entries(editingTableData.value)) {
    const [rowIdx, col] = key.split('-')
    tableData[parseInt(rowIdx)][col] = newValue
  }
  // 创建修改历史记录（可选）
  const now = new Date()
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  // 这里可以添加到表格的版本历史
  selectedTable.value.versionHistory.unshift({
    message: tableEditReviewRequest.value.description,
    type: 'update',
    author: '操作者',
    timestamp: timestamp,
    details: `修改了 ${changedRows.value.length} 行数据，已提交给 ${tableEditReviewRequest.value.reviewerId} 审核`
  })
  addNotification(`已提交审核，共修改 ${changedRows.value.length} 行数据`, 'success')
  // 关闭编辑模式
  isEditingTable.value = false
  changedRows.value = []
  editingTableData.value = {}
  showSubmitReviewModal.value = false
}
function addNotification(message, type = 'info') {
  const id = Date.now()
  notifications.value.push({ id, message, type })
  // 3秒后自动移除
  setTimeout(() => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }, 3000)
}
// 数据同步相关函数
function mergePullRequest() {
  if (selectedPR.value) {
    selectedPR.value.status = 'merged'
    addNotification('编辑请求已合并，表格数据已更新', 'success')
    selectedPRId.value = null
  }
}

function rejectPullRequest() {
  if (selectedPR.value) {
    selectedPR.value.status = 'rejected'
    addNotification('编辑请求已拒绝', 'info')
    selectedPRId.value = null
  }
}

// 工具函数
function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60) return diffMins + '分钟前'
  if (diffHours < 24) return diffHours + '小时前'
  if (diffDays < 7) return diffDays + '天前'
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>
<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from {
  transform: translateX(30px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateX(30px);
  opacity: 0;
}
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
/* 通知滑入动画 */
.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>