<template>
  <div class="bg-gray-50 min-h-screen font-sans flex flex-col relative">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-10 bg-white border-b-4 border-black h-20 flex items-center px-8">
      <div class="flex items-center space-x-3">
        <div class="bg-black p-1">
          <iconify-icon class="text-neo-lime text-2xl" icon="material-symbols:rocket-launch"></iconify-icon>
        </div>
        <h1 class="text-3xl font-display font-black tracking-tighter italic text-black uppercase transform -skew-x-6">表格管理平台</h1>
      </div>
      <div class="ml-auto flex items-center space-x-6">
        <div class="relative">
          <input
              v-model="searchQuery"
              class="w-64 px-4 py-2 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="搜索表格..." type="text" />
          <iconify-icon class="absolute right-3 top-2.5 text-gray-500 text-xl" icon="mdi:magnify"></iconify-icon>
        </div>
        <div class="flex items-center space-x-2 py-1 px-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-neo-pink transform -rotate-2">
          <span class="font-black text-black uppercase">管理员</span>
        </div>
        <router-link to="/operator" class="neo-btn px-4 py-2 text-black hover:text-black no-underline inline-block">
          操作者视图
        </router-link>
      </div>
    </header>
    <!-- 页面选项卡 -->
    <div class="bg-white border-b-4 border-black px-8 py-4 animate-fade-in-up">
      <div class="flex items-center space-x-4">
        <button @click="currentTab = 'tableSpace'"
                :class="['px-6 py-3 font-medium transition border-b-2',
            currentTab === 'tableSpace'
              ? 'bg-neo-lime text-black translate-x-[2px] translate-y-[2px] shadow-none'
              : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-black']">
          <iconify-icon icon="mdi:table" class="inline mr-2"></iconify-icon>
          表格空间
        </button>
        <button @click="currentTab = 'permissions'"
                :class="['px-6 py-3 font-medium transition border-b-2 relative',
            currentTab === 'permissions'
              ? 'bg-neo-lime text-black translate-x-[2px] translate-y-[2px] shadow-none'
              : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-black']">
          <iconify-icon icon="mdi:shield-lock" class="inline mr-2"></iconify-icon>
          权限设置
          <span v-if="pendingPermissionRequests > 0" class="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold leading-none text-white bg-black border-2 border-black">{{ pendingPermissionRequests }}</span>
        </button>
        <button @click="currentTab = 'applications'"
                :class="['px-6 py-3 font-medium transition border-b-2 relative',
            currentTab === 'applications'
              ? 'bg-neo-lime text-black translate-x-[2px] translate-y-[2px] shadow-none'
              : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-black']">
          <iconify-icon icon="mdi:clipboard-check" class="inline mr-2"></iconify-icon>
          权限申请审批
          <span v-if="pendingPermissionRequests > 0" class="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold leading-none text-white bg-black border-2 border-black">{{ pendingPermissionRequests }}</span>
        </button>
        <button @click="currentTab = 'dataSync'"
                :class="['px-6 py-3 font-medium transition border-b-2 relative',
            currentTab === 'dataSync'
              ? 'bg-neo-lime text-black translate-x-[2px] translate-y-[2px] shadow-none'
              : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-black']">
          <iconify-icon icon="mdi:cloud-sync" class="inline mr-2"></iconify-icon>
          数据同步
          <span v-if="pendingDataChangeRequests > 0" class="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold leading-none text-white bg-black border-2 border-black">{{ pendingDataChangeRequests }}</span>
        </button>
      </div>
    </div>
    <!-- 主容器 -->
    <div class="flex-1 overflow-hidden flex bg-transparent p-4">
      <!-- 表格空间标签页 -->
      <template v-if="currentTab === 'tableSpace'">
        <!-- 左侧：表格列表 -->
        <div class="w-80 bg-white border-4 border-black shadow-neo flex flex-col m-2 mr-3 rounded-none">
          <div class="border-b-4 border-black p-4 bg-neo-yellow">
            <h2 class="text-xl font-black text-black uppercase tracking-tight">管理的表格</h2>
            <p class="text-xs font-bold text-black border-2 border-black bg-white inline-block px-1 mt-1">共 {{ adminTables.length }} 个表格</p>
          </div>
          <!-- 搜索 -->
          <div class="border-b-4 border-black p-4 bg-white">
            <div class="relative">
              <input v-model="tableSearchQuery" type="text" placeholder="搜索表格..."
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              <iconify-icon icon="mdi:magnify" class="absolute right-3 top-2.5 text-gray-500"></iconify-icon>
            </div>
          </div>
          <!-- 表格列表 -->
          <div class="flex-1 overflow-y-auto p-0">
            <div class="space-y-0 p-0">
              <div v-for="table in filteredAdminTables" :key="table.id"
                   :class="['p-4 rounded-lg border-l-4 transition hover:shadow-md cursor-pointer',
                  selectedTableId === table.id
                    ? 'border-l-indigo-600 bg-indigo-50 border border-indigo-200'
                    : 'border-l-gray-300 bg-white border border-gray-200 hover:border-gray-300']"
                   @click="selectedTableId = table.id">
                <h3 class="font-medium text-gray-900">{{ table.name }}</h3>
                <p class="text-xs text-gray-600 mt-1 line-clamp-2">{{ table.description }}</p>
                <div class="flex items-center justify-between mt-3">
                  <span :class="['text-xs font-mono border border-current px-1', selectedTableId === table.id ? 'text-neo-lime' : 'text-black']">OWNER: {{ table.owner }}</span>
                  <span class="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                    {{ table.columns }} 列
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 右侧：表格详情 -->
        <div class="flex-1 flex flex-col m-2 ml-3">
          <div v-if="selectedTable" class="neo-card flex flex-col overflow-hidden h-full rounded-none border-b-4 bg-white">
            <!-- 表格详情头部 -->
            <div class="bg-black text-white px-6 py-4 flex items-center justify-between border-b-4 border-black">
              <div>
                <h2 class="text-4xl font-black font-display uppercase tracking-tighter">{{ selectedTable.name }}</h2>
                <p class="text-neo-lime text-sm mt-1 font-mono font-bold">{{ selectedTable.description }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <!-- 新增：列权限按钮 -->
                <button @click="openColumnPermissionModal" class="text-white hover:bg-indigo-800 rounded-lg px-3 py-2 flex items-center space-x-1 transition border border-indigo-500 bg-indigo-700 bg-opacity-50">
                  <iconify-icon icon="mdi:shield-account-outline" class="text-xl"></iconify-icon>
                  <span class="text-sm font-medium">列权限</span>
                </button>
                <div class="h-6 w-px bg-indigo-400 mx-2"></div>
                <button @click="startEditingTable" class="text-white hover:bg-indigo-800 rounded-lg px-3 py-2 flex items-center space-x-1 transition">
                  <iconify-icon icon="mdi:pencil" class="text-xl"></iconify-icon>
                  <span class="text-sm font-black">编辑</span>
                </button>
                <button @click="goToDataSync" class="neo-btn px-4 py-2 flex items-center space-x-2 text-black hover:bg-white hover:text-black">
                  <iconify-icon icon="mdi:cloud-sync" class="text-xl"></iconify-icon>
                  <span class="text-sm font-black">数据同步</span>
                </button>
                <button @click="importTableData(selectedTableId)" class="text-white hover:bg-indigo-800 rounded-lg px-3 py-2 flex items-center space-x-1 transition">
                  <iconify-icon icon="mdi:upload" class="text-xl"></iconify-icon>
                  <span class="text-sm font-medium">导入</span>
                </button>
                <button @click="exportTableData(selectedTableId)" class="text-white hover:bg-indigo-800 rounded-lg px-3 py-2 flex items-center space-x-1 transition">
                  <iconify-icon icon="mdi:download" class="text-xl"></iconify-icon>
                  <span class="text-sm font-black">导出</span>
                </button>
                <div class="relative">
                  <button @click="toggleTableMenu" class="neo-btn-secondary px-3 py-2 flex items-center bg-white text-black">
                    <iconify-icon icon="mdi:dots-vertical" class="text-xl"></iconify-icon>
                  </button>
                  <div v-if="showTableMenu" class="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg z-10 min-w-48 text-gray-800">
                    <button @click="showTableDetails" class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 first:rounded-t-lg flex items-center">
                      <iconify-icon icon="mdi:information-outline" class="mr-2"></iconify-icon>
                      查看详情
                    </button>
                    <button @click="deleteTable" class="w-full text-left px-4 py-3 text-black font-bold hover:bg-neo-pink hover:text-white flex items-center">
                      <iconify-icon icon="mdi:delete-outline" class="mr-2"></iconify-icon>
                      删除表格
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- 表格信息 -->
            <div class="p-6 border-b-4 border-black bg-white">
              <div class="grid grid-cols-3 gap-6">
                <div class="border-2 border-black p-4 shadow-neo-sm bg-neo-white">
                  <p class="text-xs font-black uppercase text-gray-500 mb-1">所有者</p>
                  <p class="text-xl font-black text-black">{{ selectedTable.owner }}</p>
                  <p class="text-xs font-bold text-black border-t-2 border-black mt-2 pt-1 inline-block">{{ selectedTable.ownerDept }} • {{ selectedTable.ownerPosition }}</p>
                </div>
                <div class="border-2 border-black p-4 shadow-neo-sm bg-neo-white">
                  <p class="text-xs font-black uppercase text-gray-500 mb-1">管理员</p>
                  <div class="mt-2 space-y-1">
                    <p v-for="admin in selectedTable.admins" :key="admin.id" class="text-sm font-bold text-black">
                      > {{ admin.name }}
                    </p>
                  </div>
                </div>
                <div class="border-2 border-black p-4 shadow-neo-sm bg-neo-white">
                  <p class="text-xs font-black uppercase text-gray-500 mb-1">表格规模</p>
                  <p class="text-xl font-black text-black">{{ selectedTable.columns }} 列</p>
                  <p class="text-xs font-bold text-black border-t-2 border-black mt-2 pt-1 inline-block">{{ selectedTable.rows }} 行</p>
                </div>
              </div>
            </div>
            <!-- 表格预览/编辑 -->
            <div v-if="!isEditingTable" class="flex-1 overflow-auto p-6">
              <table class="w-full text-sm border-collapse">
                <thead class="bg-gray-100 sticky top-0">
                <tr>
                  <th v-for="col in selectedTable.allColumns" :key="col"
                      class="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                    {{ col }}
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(row, idx) in getTableData(selectedTableId)" :key="idx"
                    class="hover:bg-gray-50 border-b border-gray-200">
                  <td v-for="col in selectedTable.allColumns" :key="col"
                      class="px-4 py-3 text-gray-700">
                    {{ row[col] || '-' }}
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
            <!-- 编辑模式 -->
            <div v-else class="flex-1 overflow-auto p-6 bg-neo-yellow pattern-grid-lg">
              <div class="mb-6 p-4 bg-white border-4 border-black shadow-neo">
                <p class="font-black text-xl uppercase">EDIT MODE ACTIVE</p>
                <p class="text-sm font-bold mt-1 bg-black text-white inline-block px-2">点击单元格进行编辑，完成后点击提交审核按钮</p>
              </div>
              <table class="w-full text-sm border-collapse border border-gray-300 bg-white">
                <thead class="bg-gray-100 sticky top-0">
                <tr>
                  <th v-for="col in selectedTable.allColumns" :key="col"
                      class="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300">
                    {{ col }}
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(row, idx) in getTableData(selectedTableId)" :key="idx"
                    :class="['border-b border-gray-300', changedRows.includes(idx) ? 'bg-yellow-100' : 'bg-white hover:bg-gray-50']">
                  <td v-for="col in selectedTable.allColumns" :key="col"
                      class="px-0 py-0 border border-gray-300">
                    <input
                        :value="editingTableData[idx + '-' + col] !== undefined ? editingTableData[idx + '-' + col] : (row[col] || '')"
                        @input="(e) => {
                          editingTableData[idx + '-' + col] = e.target.value
                          if (!changedRows.includes(idx)) changedRows.push(idx)
                        }"
                        @blur="(e) => {
                          if (editingTableData[idx + '-' + col] === (row[col] || '')) {
                            delete editingTableData[idx + '-' + col]
                            if (changedRows.includes(idx)) {
                              changedRows = changedRows.filter(i => i !== idx)
                            }
                          }
                        }"
                        class="w-full px-4 py-3 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-transparent"
                    />
                  </td>
                </tr>
                </tbody>
              </table>
              <div class="mt-6 flex gap-4">
                <button @click="submitTableChangesForReview"
                        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
                  提交审核
                </button>
                <button @click="cancelTableEdit"
                        class="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition">
                  取消编辑
                </button>
              </div>
            </div>
          </div>
          <!-- 未选中表格提示 -->
          <div v-else class="neo-card flex items-center justify-center h-full bg-white">
            <div class="text-center p-10 border-4 border-black shadow-neo-lg bg-neo-lime">
              <iconify-icon icon="mdi:table-search" class="text-8xl text-black mx-auto mb-4"></iconify-icon>
              <p class="text-4xl font-black text-black mb-2 uppercase font-display">SELECT A TABLE</p>
              <p class="text-black font-bold border-t-4 border-black pt-4 mt-4">从左侧列表选择表格，查看详细信息</p>
            </div>
          </div>
        </div>
      </template>
      <!-- 权限设置标签页 -->
      <template v-if="currentTab === 'permissions'">
        <div class="w-1/3 bg-white border-4 border-black shadow-neo flex flex-col m-2 mr-3">
          <div class="border-b-4 border-black p-4 bg-neo-yellow">
            <h2 class="text-xl font-black text-black uppercase">项目列表</h2>
          </div>
          <div class="flex-1 overflow-y-auto">
            <div class="space-y-0 p-0">
              <div v-for="project in projects" :key="project.id"
                   :class="['p-4 rounded-lg border-l-4 transition hover:shadow-md cursor-pointer',
                  selectedProjectId === project.id
                    ? 'border-l-indigo-600 bg-indigo-50 border border-indigo-200'
                    : 'border-l-gray-300 bg-white border border-gray-200 hover:border-gray-300']"
                   @click="selectedProjectId = project.id">
                <h3 class="font-medium text-gray-900">{{ project.name }}</h3>
                <p class="text-xs text-gray-600 mt-1">{{ project.department }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="flex-1 bg-white rounded-xl shadow flex flex-col m-6 ml-3">
          <div v-if="selectedProject" class="h-full flex flex-col">
            <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold">{{ selectedProject.name }}</h2>
                <p class="text-indigo-100 text-sm mt-1">{{ selectedProject.department }}项目权限设置</p>
              </div>
              <div class="flex items-center space-x-2">
                <button @click="importTableDataForProject(selectedProject.id)" class="text-white hover:bg-indigo-800 rounded-lg px-3 py-2 flex items-center space-x-1 transition">
                  <iconify-icon icon="mdi:upload" class="text-xl"></iconify-icon>
                  <span class="text-sm font-medium">导入数据</span>
                </button>
                <button @click="exportProjectData(selectedProject.id)" class="text-white hover:bg-indigo-800 rounded-lg px-3 py-2 flex items-center space-x-1 transition">
                  <iconify-icon icon="mdi:download" class="text-xl"></iconify-icon>
                  <span class="text-sm font-medium">导出数据</span>
                </button>
                <button @click="goToDataSyncForProject(selectedProject.id)" class="text-white hover:bg-indigo-800 rounded-lg px-3 py-2 flex items-center space-x-1 transition">
                  <iconify-icon icon="mdi:cloud-sync" class="text-xl"></iconify-icon>
                  <span class="text-sm font-medium">数据同步</span>
                </button>
              </div>
            </div>
            <div class="flex-1 overflow-auto p-6 space-y-6">
              <div>
                <h3 class="font-medium text-gray-900 mb-3">项目成员管理</h3>
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-4">
                    <p class="text-sm font-medium">成员列表</p>
                    <button class="text-blue-600 text-sm font-medium">添加成员</button>
                  </div>
                  <div class="flex flex-wrap gap-3">
                    <div v-for="member in projectMembers" :key="member.id" class="flex items-center bg-white px-3 py-2 rounded-lg border border-gray-200">
                      <div class="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 mr-2"></div>
                      <span class="mr-2">{{ member.name }}</span>
                      <span :class="['text-xs px-2 py-0.5 rounded', member.roleClass]">
                        {{ member.role }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 mb-3">权限角色配置</h3>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                    <tr class="bg-gray-100 text-left text-gray-700">
                      <th class="px-4 py-3">功能权限</th>
                      <th class="px-4 py-3">管理员</th>
                      <th class="px-4 py-3">编辑者</th>
                      <th class="px-4 py-3">查看者</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="perm in permissions" :key="perm.id" class="border-b border-gray-200 hover:bg-gray-50">
                      <td class="px-4 py-3">{{ perm.name }}</td>
                      <td class="px-4 py-3">
                        <iconify-icon v-if="perm.admin" class="text-green-500 text-xl" icon="mdi:check-circle"></iconify-icon>
                        <iconify-icon v-else class="text-gray-300 text-xl" icon="mdi:close-circle"></iconify-icon>
                      </td>
                      <td class="px-4 py-3 border-r-2 border-black text-center">
                        <iconify-icon v-if="perm.editor" class="text-black text-xl" icon="mdi:check-bold"></iconify-icon>
                        <iconify-icon v-else class="text-gray-300 text-xl" icon="mdi:close-thick"></iconify-icon>
                      </td>
                      <td class="px-4 py-3 text-center">
                        <iconify-icon v-if="perm.viewer" class="text-black text-xl" icon="mdi:check-bold"></iconify-icon>
                        <iconify-icon v-else class="text-gray-300 text-xl" icon="mdi:close-thick"></iconify-icon>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-full">
            <div class="text-center">
              <iconify-icon icon="mdi:folder-account" class="text-6xl text-gray-300 mx-auto mb-4"></iconify-icon>
              <p class="text-xl font-medium text-gray-900 mb-2">请选择一个项目</p>
              <p class="text-gray-600">从左侧列表选择项目，设置权限</p>
            </div>
          </div>
        </div>
      </template>
      <!-- 权限申请审批标签页 -->
      <template v-if="currentTab === 'applications'">
        <div class="w-80 bg-white border-4 border-black shadow-neo flex flex-col m-2 mr-3">
          <div class="border-b-4 border-black p-4 bg-neo-yellow">
            <h2 class="text-xl font-black text-black uppercase">申请列表</h2>
            <p class="text-xs font-bold text-black border-2 border-black bg-white inline-block px-1 mt-1">共 {{ applications.length }} 个</p>
          </div>
          <div class="flex-1 overflow-y-auto">
            <div class="space-y-0 p-0">
              <div v-for="app in applications" :key="app.id"
                   :class="['p-3 rounded-lg border-l-4 transition hover:shadow-md cursor-pointer',
                  selectedApplication?.id === app.id
                    ? 'border-l-blue-600 bg-blue-50 border border-blue-200'
                    : 'border-l-gray-300 bg-white border border-gray-200 hover:border-gray-300']"
                   @click="selectedApplication = app">
                <h3 class="font-medium text-gray-900 text-sm">{{ app.tableName }}</h3>
                <p class="text-xs text-gray-600 mt-1">申请人: {{ app.applicant }}</p>
                <div class="flex items-center justify-between mt-2">
                  <p class="text-xs font-mono opacity-60">{{ app.submitTime.split(' ')[0] }}</p>
                  <span :class="['px-2 py-0.5 border border-current text-xs font-bold uppercase',
                    app.status === 'approved' ? 'bg-neo-lime text-black' :
                    app.status === 'rejected' ? 'bg-neo-pink text-white' :
                    'bg-neo-yellow text-black']">
                    {{ app.status === 'approved' ? '已批准' : app.status === 'rejected' ? '已拒绝' : '待审批' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex-1 bg-white rounded-xl shadow flex flex-col m-6 ml-3">
          <div v-if="selectedApplication" class="h-full flex flex-col">
            <div class="border-b-4 border-black p-6 bg-white">
              <h2 class="text-3xl font-black text-black uppercase">申请详情</h2>
            </div>
            <div class="flex-1 overflow-auto p-6 space-y-6 bg-white">
              <div>
                <h3 class="text-sm font-black text-black mb-2 uppercase border-b-2 border-black inline-block">申请表格</h3>
                <div class="bg-neo-white border-2 border-black p-4 shadow-neo-sm">
                  <p class="text-xl font-black text-black">{{ selectedApplication.tableName }}</p>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-black text-black mb-2 uppercase border-b-2 border-black inline-block">申请人</h3>
                <div class="flex items-center">
                  <div class="bg-black text-white flex items-center justify-center font-bold border-2 border-black w-10 h-10 mr-3">
                    <iconify-icon icon="mdi:account" class="text-2xl"></iconify-icon>
                  </div>
                  <div>
                    <p class="font-black text-lg text-black uppercase">{{ selectedApplication.applicant }}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-black text-black mb-2 uppercase border-b-2 border-black inline-block">申请原因</h3>
                <div class="bg-neo-yellow border-2 border-black p-4 shadow-neo-sm">
                  <p class="text-black font-bold">{{ selectedApplication.reason }}</p>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-black text-black mb-2 uppercase border-b-2 border-black inline-block">申请时间</h3>
                <p class="text-black font-mono font-bold">{{ selectedApplication.submitTime }}</p>
              </div>
              <div v-if="selectedApplication.status === 'pending'" class="pt-4 border-t border-gray-200">
                <h3 class="text-sm font-medium text-gray-500 mb-3">审批操作</h3>
                <textarea v-model="approvalComment"
                          placeholder="请输入审批意见（至少20字）..."
                          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none h-24 mb-3"
                ></textarea>
                <p class="text-xs text-black font-bold mb-4 bg-neo-lime inline-block px-1 border border-black">{{ approvalComment.length }}/200 字</p>
                <div class="flex gap-4">
                  <button @click="rejectApplication"
                          class="flex-1 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition">
                    拒绝
                  </button>
                  <button @click="approveApplication"
                          class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
                    批准
                  </button>
                </div>
              </div>
              <div v-else class="text-center py-8 border-4 border-black shadow-neo bg-gray-100">
                <p class="text-black font-black uppercase">此申请已处理，不可再进行操作</p>
              </div>
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-full bg-white">
            <div class="text-center p-8 border-4 border-black bg-neo-lime shadow-neo-lg">
              <iconify-icon icon="mdi:clipboard-search" class="text-6xl text-black mx-auto mb-4"></iconify-icon>
              <p class="text-3xl font-black text-black mb-2 uppercase">SELECT AN APPLICATION</p>
              <p class="text-black font-bold border-t-2 border-black pt-2 mt-2">从左侧列表选择申请，查看详细信息</p>
            </div>
          </div>
        </div>
      </template>
      <!-- 数据同步标签页 -->
      <template v-if="currentTab === 'dataSync'">
        <!-- 左侧：PR列表 -->
        <div class="w-80 bg-white border-4 border-black shadow-neo flex flex-col m-2 mr-3">
          <div class="border-b-4 border-black p-4 bg-neo-yellow">
            <h2 class="text-xl font-black text-black uppercase">编辑请求</h2>
            <p class="text-xs font-bold text-black border-2 border-black bg-white inline-block px-1 mt-1">共 {{ pullRequests.length }} 个请求</p>
          </div>
          <!-- 搜索和筛选 -->
          <div class="border-b-4 border-black p-4 space-y-3 bg-white">
            <div class="relative">
              <input v-model="prSearchQuery" type="text" placeholder="搜索PR..."
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" />
              <iconify-icon icon="mdi:magnify" class="absolute right-3 top-2.5 text-gray-500"></iconify-icon>
            </div>
            <div class="flex gap-2">
              <button @click="prStatusFilter = null"
                      :class="['px-3 py-1 rounded-full text-xs font-medium transition',
                  prStatusFilter === null
                    ? 'bg-black text-white shadow-none translate-x-[1px] translate-y-[1px]'
                    : 'bg-white text-black shadow-neo-sm hover:bg-gray-100']">
                全部
              </button>
              <button @click="prStatusFilter = 'pending'"
                      :class="['px-3 py-1 rounded-full text-xs font-medium transition',
                  prStatusFilter === 'pending'
                    ? 'bg-neo-yellow text-black shadow-none translate-x-[1px] translate-y-[1px]'
                    : 'bg-white text-black shadow-neo-sm hover:bg-neo-yellow']">
                待审批
              </button>
              <button @click="prStatusFilter = 'merged'"
                      :class="['px-3 py-1 rounded-full text-xs font-medium transition',
                  prStatusFilter === 'merged'
                    ? 'bg-neo-lime text-black shadow-none translate-x-[1px] translate-y-[1px]'
                    : 'bg-white text-black shadow-neo-sm hover:bg-neo-lime']">
                已合并
              </button>
            </div>
          </div>
          <!-- PR列表 -->
          <div class="flex-1 overflow-y-auto">
            <div class="space-y-0 p-0">
              <div v-if="filteredPullRequests.length === 0" class="p-4 text-center text-black font-bold uppercase">
                暂无编辑请求
              </div>
              <div v-for="pr in filteredPullRequests" :key="pr.id"
                   :class="['p-4 rounded-lg border-l-4 transition hover:shadow-md cursor-pointer',
                  selectedPRId === pr.id
                    ? 'border-l-indigo-600 bg-indigo-50 border border-indigo-200'
                    : 'border-l-gray-300 bg-white border border-gray-200 hover:border-gray-300']"
                   @click="selectedPRId = pr.id">
                <div class="flex items-start justify-between mb-2">
                  <h3 class="font-black text-sm uppercase">{{ pr.tableName }}</h3>
                  <span :class="['px-2 py-0.5 border border-current text-xs font-black uppercase',
                    pr.status === 'merged' ? 'bg-neo-lime text-black' :
                    pr.status === 'pending' ? 'bg-neo-yellow text-black' :
                    'bg-neo-pink text-white']">
                    {{ pr.status === 'merged' ? '已合并' : pr.status === 'pending' ? '待审批' : '已拒绝' }}
                  </span>
                </div>
                <p class="text-xs font-bold mb-2 line-clamp-2 opacity-80">{{ pr.description }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono opacity-70">BY: {{ pr.submitter }}</span>
                  <span class="text-xs font-mono opacity-70">{{ formatDate(pr.submitTime) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 右侧：PR详情和diff -->
        <div class="flex-1 bg-white border-4 border-black shadow-neo flex flex-col m-2 ml-3">
          <div v-if="selectedPRId !== null && selectedPR" class="h-full flex flex-col">
            <!-- 头部信息 -->
            <div class="border-b-4 border-black p-6 bg-white">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h2 class="text-3xl font-black text-black uppercase">{{ selectedPR.tableName }}</h2>
                  <p class="text-sm font-bold text-black border-2 border-black bg-neo-yellow inline-block px-1 mt-2">REQUEST #{{ selectedPR.id }}</p>
                </div>
                <span :class="['px-4 py-2 border-2 border-black shadow-neo-sm font-black uppercase text-sm',
                  selectedPR.status === 'merged' ? 'bg-neo-lime text-black' :
                  selectedPR.status === 'pending' ? 'bg-neo-yellow text-black' :
                  'bg-neo-pink text-white']">
                  {{ selectedPR.status === 'merged' ? '已合并' : selectedPR.status === 'pending' ? '待审批' : '已拒绝' }}
                </span>
              </div>
              <div class="flex items-center space-x-6 text-sm">
                <div class="border-l-4 border-black pl-2">
                  <p class="text-gray-500 font-bold uppercase text-xs">提交人</p>
                  <p class="font-black text-lg text-black">{{ selectedPR.submitter }}</p>
                </div>
                <div class="border-l-4 border-black pl-2">
                  <p class="text-gray-500 font-bold uppercase text-xs">提交时间</p>
                  <p class="font-black text-lg text-black">{{ selectedPR.submitTime }}</p>
                </div>
                <div class="border-l-4 border-black pl-2">
                  <p class="text-gray-500 font-bold uppercase text-xs">变更数</p>
                  <p class="font-black text-lg text-black">{{ selectedPR.changes.length }} 项</p>
                </div>
              </div>
            </div>
            <!-- 内容区 -->
            <div class="flex-1 overflow-auto p-6 bg-white">
              <div class="space-y-6">
                <!-- 概述 -->
                <div>
                  <h3 class="text-lg font-black text-black mb-3 uppercase border-l-8 border-neo-pink pl-2">变更说明</h3>
                  <div class="bg-neo-white border-2 border-black p-4 shadow-neo-sm">
                    <p class="text-black font-bold whitespace-pre-wrap">{{ selectedPR.description }}</p>
                  </div>
                </div>
                <!-- 证明材料 -->
                <div v-if="selectedPR.proofFiles && selectedPR.proofFiles.length > 0">
                  <h3 class="text-lg font-bold text-gray-900 mb-3">证明材料</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div v-for="(file, index) in selectedPR.proofFiles" :key="index"
                         class="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                      <div class="flex items-center space-x-3 overflow-hidden">
                        <div class="bg-indigo-200 rounded p-2 text-indigo-700 flex-shrink-0">
                          <iconify-icon icon="mdi:file-document-outline" class="text-xl"></iconify-icon>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-gray-900 truncate" :title="file.name">{{ file.name }}</p>
                          <p class="text-xs text-gray-500">{{ file.size }}</p>
                        </div>
                      </div>
                      <button class="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-100 transition" title="下载文件">
                        <iconify-icon icon="mdi:download" class="text-lg"></iconify-icon>
                      </button>
                    </div>
                  </div>
                </div>
                <!-- 变更详情 -->
                <div>
                  <h3 class="text-lg font-black text-black mb-3 uppercase border-l-8 border-neo-pink pl-2">变更详情</h3>
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
                          <span class="text-sm text-black font-bold">
                            <strong class="uppercase">{{ change.column }}</strong>
                            <span v-if="change.type === 'modify'" class="font-mono text-xs ml-1 bg-gray-200 px-1 border border-black">ROW {{ change.rowIdx + 1 }}</span>
                          </span>
                        </div>
                      </div>
                      <div v-if="change.type === 'modify'" class="flex items-center space-x-4 text-sm mt-2">
                        <div class="flex-1">
                          <p class="text-gray-500 font-bold text-xs mb-1 uppercase">OLD VALUE</p>
                          <div class="bg-gray-100 border-2 border-black px-3 py-2 text-gray-500 font-mono text-sm line-through">
                            {{ change.oldValue || '(空)' }}
                          </div>
                        </div>
                        <iconify-icon icon="mdi:arrow-right-thick" class="text-black text-2xl"></iconify-icon>
                        <div class="flex-1">
                          <p class="text-black font-bold text-xs mb-1 uppercase">NEW VALUE</p>
                          <div class="bg-neo-lime border-2 border-black px-3 py-2 text-black font-black font-mono text-sm">
                            {{ change.newValue || '(空)' }}
                          </div>
                        </div>
                      </div>
                      <div v-else-if="change.type === 'add'" class="text-sm border-t-2 border-black pt-2 mt-2">
                        <p class="text-black font-bold text-xs mb-1 uppercase">新增内容</p>
                        <div class="bg-neo-lime border-2 border-black px-3 py-2 text-black font-black font-mono shadow-neo-sm">
                          {{ change.newValue || '(新行)' }}
                        </div>
                      </div>
                      <div v-else class="text-sm border-t-2 border-black pt-2 mt-2">
                        <p class="text-black font-bold text-xs mb-1 uppercase">删除内容</p>
                        <div class="bg-neo-pink border-2 border-black px-3 py-2 text-white font-black font-mono shadow-neo-sm">
                          {{ change.oldValue || '(整行)' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 操作按钮 -->
            <div v-if="selectedPR.status === 'pending'" class="border-t-4 border-black p-6 flex gap-4 bg-white">
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
          <!-- 空状态 -->
          <div v-else class="flex items-center justify-center h-full bg-white">
            <div class="text-center p-8 border-4 border-black bg-neo-yellow shadow-neo-lg">
              <iconify-icon icon="mdi:git-branch" class="text-6xl text-black mx-auto mb-4"></iconify-icon>
              <p class="text-3xl font-black text-black mb-2 uppercase">SELECT A REQUEST</p>
              <p class="text-black font-bold border-t-2 border-black pt-2 mt-2">从左侧列表选择请求，查看详细的变更信息</p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 冲突检测模态框 -->
    <div v-if="showConflictModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- 头部 -->
        <div class="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-orange-100 rounded-full text-orange-600">
              <iconify-icon icon="mdi:alert-decagram" class="text-2xl"></iconify-icon>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900">检测到编辑冲突</h3>
              <p class="text-sm text-orange-800">当前请求修改的单元格已被其他待审核请求修改</p>
            </div>
          </div>
          <button @click="closeConflictModal" class="text-gray-400 hover:text-gray-600">
            <iconify-icon icon="mdi:close" class="text-2xl"></iconify-icon>
          </button>
        </div>

        <!-- 冲突对比区域 -->
        <div class="flex-1 overflow-auto p-6 bg-gray-50">
          <div class="grid grid-cols-2 gap-6">
            <!-- 左侧：当前请求 -->
            <div class="bg-white border-2 border-indigo-500 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div class="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex justify-between items-center">
                <span class="font-bold text-indigo-900">当前正在审核的请求</span>
                <span class="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded">#{{ selectedPR?.id }}</span>
              </div>
              <div class="p-4 flex-1">
                <p class="text-sm text-gray-500 mb-2">提交人: <span class="text-gray-900 font-medium">{{ selectedPR?.submitter }}</span></p>
                <div class="space-y-3">
                  <div v-for="(change, idx) in currentConflictChanges" :key="'curr-'+idx" class="bg-indigo-50 border border-indigo-100 p-3 rounded text-sm">
                    <div class="flex justify-between mb-1">
                      <span class="font-bold text-gray-700">{{ change.column }}</span>
                      <span class="text-xs text-gray-500">第 {{ change.rowIdx + 1 }} 行</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="line-through text-gray-400">{{ change.oldValue }}</span>
                      <iconify-icon icon="mdi:arrow-right" class="text-gray-400"></iconify-icon>
                      <span class="font-bold text-indigo-700">{{ change.newValue }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 p-4 border-t border-gray-100 mt-auto text-center">
                <p class="text-xs text-gray-500 mb-2">如果不处理冲突，直接合并：</p>
                <button @click="resolveConflict('merge_current')" class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-sm">
                  合并此请求 (自动拒绝冲突方)
                </button>
              </div>
            </div>

            <!-- 右侧：冲突请求 -->
            <div class="bg-white border-2 border-orange-400 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div class="bg-orange-50 px-4 py-3 border-b border-orange-100 flex justify-between items-center">
                <span class="font-bold text-orange-900">发现冲突的请求</span>
                <span class="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">#{{ conflictPrData?.id }}</span>
              </div>
              <div class="p-4 flex-1">
                <p class="text-sm text-gray-500 mb-2">提交人: <span class="text-gray-900 font-medium">{{ conflictPrData?.submitter }}</span></p>
                <div class="space-y-3">
                  <div v-for="(change, idx) in conflictPrChanges" :key="'conf-'+idx" class="bg-orange-50 border border-orange-100 p-3 rounded text-sm">
                    <div class="flex justify-between mb-1">
                      <span class="font-bold text-gray-700">{{ change.column }}</span>
                      <span class="text-xs text-gray-500">第 {{ change.rowIdx + 1 }} 行</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="line-through text-gray-400">{{ change.oldValue }}</span>
                      <iconify-icon icon="mdi:arrow-right" class="text-gray-400"></iconify-icon>
                      <span class="font-bold text-orange-700">{{ change.newValue }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 p-4 border-t border-gray-100 mt-auto text-center">
                <p class="text-xs text-gray-500 mb-2">认为冲突方的修改更准确：</p>
                <button @click="resolveConflict('reject_current')" class="w-full py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition">
                  拒绝当前请求 (保留冲突方待审)
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部通用操作 -->
        <div class="bg-gray-100 px-6 py-4 flex justify-between items-center border-t border-gray-200">
          <span class="text-sm text-gray-500">提示：如果两个请求都不合理，可以选择全部拒绝。</span>
          <button @click="resolveConflict('reject_all')" class="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition flex items-center">
            <iconify-icon icon="mdi:close-circle-outline" class="mr-2 text-lg"></iconify-icon>
            全部拒绝
          </button>
        </div>
      </div>
    </div>

    <!-- 新增：列级权限设置模态框 -->
    <div v-if="showColPermModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        <!-- 头部 -->
        <div class="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold text-gray-900">列级权限配置</h3>
            <p class="text-sm text-gray-500">设置不同角色对表格 "{{ selectedTable?.name }}" 各列的访问权限</p>
          </div>
          <button @click="closeColPermModal" class="text-gray-400 hover:text-gray-600 transition">
            <iconify-icon icon="mdi:close" class="text-2xl"></iconify-icon>
          </button>
        </div>

        <!-- 主体内容 -->
        <div class="flex flex-1 overflow-hidden">
          <!-- 左侧：角色列表 -->
          <div class="w-48 bg-gray-50 border-r border-gray-200 flex flex-col p-2 space-y-1">
            <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">选择角色</div>
            <button v-for="role in availableRoles" :key="role.id"
                    @click="switchPermRole(role.id)"
                    :class="['w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition flex items-center justify-between',
                activePermRole === role.id ? 'bg-white shadow text-indigo-700 border border-gray-200' : 'text-gray-600 hover:bg-gray-100']">
              {{ role.name }}
              <iconify-icon v-if="activePermRole === role.id" icon="mdi:chevron-right" class="text-indigo-500"></iconify-icon>
            </button>
          </div>

          <!-- 右侧：权限矩阵 -->
          <div class="flex-1 overflow-y-auto p-6 bg-white">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-bold text-gray-800">
                {{ availableRoles.find(r => r.id === activePermRole)?.name }} - 权限详情
              </h4>
              <div class="flex space-x-2">
                <button @click="toggleAllPerms('view')" class="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition">
                  全选/反选查看
                </button>
                <button @click="toggleAllPerms('edit')" class="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition">
                  全选/反选编辑
                </button>
              </div>
            </div>

            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <table class="w-full text-sm text-left">
                <thead class="bg-gray-50 text-gray-700 font-medium">
                <tr>
                  <th class="px-4 py-3 border-b border-gray-200 w-1/2">列名</th>
                  <th class="px-4 py-3 border-b border-gray-200 text-center w-1/4">可见 (View)</th>
                  <th class="px-4 py-3 border-b border-gray-200 text-center w-1/4">可编辑 (Edit)</th>
                </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                <tr v-for="col in selectedTable?.allColumns" :key="col" class="hover:bg-gray-50 transition">
                  <td class="px-4 py-3 font-medium text-gray-900">{{ col }}</td>
                  <!-- 查看权限 -->
                  <td class="px-4 py-3 text-center">
                    <label class="inline-flex items-center cursor-pointer">
                      <input type="checkbox"
                             v-model="tempPermData[activePermRole][col].view"
                             @change="handleViewChange(col)"
                             class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 transition cursor-pointer">
                    </label>
                  </td>
                  <!-- 编辑权限 -->
                  <td class="px-4 py-3 text-center">
                    <label class="inline-flex items-center" :class="!tempPermData[activePermRole][col].view ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'">
                      <input type="checkbox"
                             v-model="tempPermData[activePermRole][col].edit"
                             :disabled="!tempPermData[activePermRole][col].view"
                             class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 transition cursor-pointer disabled:cursor-not-allowed">
                    </label>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button @click="closeColPermModal" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">
            取消
          </button>
          <button @click="saveColumnPermissions" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition shadow-sm flex items-center">
            <iconify-icon icon="mdi:content-save-outline" class="mr-2"></iconify-icon>
            保存配置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// --- 原有状态 ---
const currentTab = ref('tableSpace')
const searchQuery = ref('')
const tableSearchQuery = ref('')
const selectedTableId = ref(1)
const selectedProjectId = ref(1)
const selectedApplication = ref(null)
const approvalComment = ref('')

// --- 数据同步相关状态 ---
const selectedPRId = ref(null)
const prSearchQuery = ref('')
const prStatusFilter = ref(null)
const showTableMenu = ref(false)

// --- 冲突检测相关状态 ---
const showConflictModal = ref(false)
const conflictPrData = ref(null)
const currentConflictChanges = ref([])
const conflictPrChanges = ref([])

// --- 列级权限管理相关状态 (新增) ---
const showColPermModal = ref(false)
const activePermRole = ref('role_employee')
const tempPermData = ref({}) // 临时存储模态框中的修改

// 模拟角色列表 (新增)
const availableRoles = [
  { id: 'role_manager', name: '部门经理' },
  { id: 'role_employee', name: '普通员工' },
  { id: 'role_finance', name: '财务专员' },
  { id: 'role_auditor', name: '审计人员' }
]

// 表格数据 (更新结构)
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
    allColumns: ['项目ID', '项目名称', '负责人', '开始时间', '预期完成时间', '状态', '预算', '实际支出'],
    // 新增字段
    columnPermissions: {
      'role_manager': {}, // 经理默认全权
      'role_employee': {  // 普通员工示例
        '项目ID': { view: true, edit: false },
        '项目名称': { view: true, edit: false },
        '负责人': { view: true, edit: false },
        '开始时间': { view: true, edit: false },
        '预期完成时间': { view: true, edit: false },
        '状态': { view: true, edit: true },
        '预算': { view: false, edit: false },
        '实际支出': { view: false, edit: false }
      }
    },
    versionHistory: []
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
    allColumns: ['员工ID', '员工名称', '部门', '月份', '绩效评分', '备注'],
    columnPermissions: {},
    versionHistory: []
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
    allColumns: ['部门', '预算总额', '已支出', '预留', '年份', '审批状态', '负责人'],
    columnPermissions: {},
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
    allColumns: ['客户ID', '客户名称', '行业', '联系电话', '地址', '合作状态', '合同金额', '业务负责人', '最后联系时间'],
    columnPermissions: {},
    versionHistory: []
  }
])

// 项目管理数据
const projects = ref([
  { id: 1, name: 'I项目系统', department: '技术部' },
  { id: 2, name: '慧人天系统', department: '人力资源部' },
  { id: 3, name: '分贝通系统', department: '财务部' },
  { id: 4, name: '企业微信管理', department: '行政部' }
])

const projectMembers = ref([
  { id: 1, name: '张工', role: '管理员', roleClass: 'bg-blue-100 text-blue-800' },
  { id: 2, name: '李技术', role: '编辑者', roleClass: 'bg-green-100 text-green-800' },
  { id: 3, name: '王经理', role: '编辑者', roleClass: 'bg-green-100 text-green-800' }
])

const permissions = ref([
  { id: 1, name: '编辑项目信息', admin: true, editor: true, viewer: false },
  { id: 2, name: '变更流程', admin: true, editor: true, viewer: false },
  { id: 3, name: '审批申请', admin: true, editor: false, viewer: false },
  { id: 4, name: '删除项目', admin: true, editor: false, viewer: false }
])

// 权限申请数据
const applications = ref([
  {
    id: 1,
    tableName: '项目信息表',
    applicant: '张工',
    reason: '需要查看项目的详细信息以进行项目规划',
    submitTime: '2025-12-08 10:30',
    status: 'pending'
  },
  {
    id: 2,
    tableName: '客户管理表',
    applicant: '王经理',
    reason: '需要编辑权限以更新客户信息',
    submitTime: '2025-12-07 14:15',
    status: 'approved'
  },
  {
    id: 3,
    tableName: '财务预算表',
    applicant: '李技术',
    reason: '需要查看部门预算信息',
    submitTime: '2025-12-06 09:45',
    status: 'pending'
  }
])

// Pull Request 数据
const pullRequests = ref([
  {
    id: 1,
    tableId: 1,
    tableName: '项目信息表',
    description: '更新项目P001的预算信息\n- 预算调整为550000\n- 实际支出更新为380000',
    submitter: '张工',
    submitTime: '2025-12-08 10:30',
    status: 'pending',
    proofFiles: [
      { name: '项目预算审批单.pdf', size: '2.5 MB' },
      { name: '2025年度支出计划.xlsx', size: '1.2 MB' }
    ],
    changes: [
      { type: 'modify', rowIdx: 0, column: '预算', oldValue: '500000', newValue: '550000' },
      { type: 'modify', rowIdx: 0, column: '实际支出', oldValue: '320000', newValue: '380000' }
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
    proofFiles: [],
    changes: [
      { type: 'modify', rowIdx: 1, column: '状态', oldValue: '进行中', newValue: '已完成' },
      { type: 'modify', rowIdx: 1, column: '实际支出', oldValue: '450000', newValue: '750000' }
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
    proofFiles: [{ name: '绩效复核报告.docx', size: '850 KB' }],
    changes: [
      { type: 'modify', rowIdx: 0, column: '绩效评分', oldValue: '95', newValue: '96' },
      { type: 'modify', rowIdx: 0, column: '备注', oldValue: '表现优秀', newValue: '杰出表现' }
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
    proofFiles: [],
    changes: [
      { type: 'modify', rowIdx: 0, column: '预算总额', oldValue: '2000000', newValue: '2200000' },
      { type: 'modify', rowIdx: 0, column: '已支出', oldValue: '1200000', newValue: '1300000' }
    ]
  },
  {
    id: 5,
    tableId: 1,
    tableName: '项目信息表',
    description: '冲突测试数据：尝试同时修改P001的预算',
    submitter: '测试员小刘',
    submitTime: '2025-12-08 11:00',
    status: 'pending',
    proofFiles: [],
    changes: [
      { type: 'modify', rowIdx: 0, column: '预算', oldValue: '500000', newValue: '600000' }
    ]
  }
])

const adminTables = computed(() => {
  return tables.value
})

const filteredAdminTables = computed(() => {
  if (!tableSearchQuery.value) return adminTables.value
  return adminTables.value.filter(t =>
      t.name.toLowerCase().includes(tableSearchQuery.value.toLowerCase()) ||
      t.description.toLowerCase().includes(tableSearchQuery.value.toLowerCase())
  )
})

const selectedTable = computed(() => {
  return tables.value.find(t => t.id === selectedTableId.value)
})

const selectedProject = computed(() => {
  return projects.value.find(p => p.id === selectedProjectId.value)
})

const selectedPR = computed(() => {
  return pullRequests.value.find(pr => pr.id === selectedPRId.value)
})

const filteredPullRequests = computed(() => {
  let result = pullRequests.value
  if (prSearchQuery.value) {
    const query = prSearchQuery.value.toLowerCase()
    result = result.filter(pr =>
        pr.tableName.toLowerCase().includes(query) ||
        pr.description.toLowerCase().includes(query) ||
        pr.submitter.toLowerCase().includes(query)
    )
  }
  if (prStatusFilter.value) {
    result = result.filter(pr => pr.status === prStatusFilter.value)
  }
  return result
})

// 待处理权限请求
const pendingPermissions = computed(() => {
  return applications.value.filter(app => app.status === 'pending')
})

const pendingPermissionRequests = computed(() => {
  return pendingPermissions.value.length
})

// 待处理数据修改请求
const pendingPRs = computed(() => {
  return pullRequests.value.filter(pr => pr.status === 'pending')
})

const pendingDataChangeRequests = computed(() => {
  return pendingPRs.value.length
})

// --- 列级权限相关方法 ---
function openColumnPermissionModal() {
  if (!selectedTable.value) return

  // 初始化/深拷贝当前表格的权限数据
  const currentTablePerms = selectedTable.value.columnPermissions || {}
  const initializedPerms = {}

  // 为每个角色、每一列确保有数据结构
  availableRoles.forEach(role => {
    initializedPerms[role.id] = {}
    selectedTable.value.allColumns.forEach(col => {
      // 获取现有配置，或者默认全开(view=true, edit=false)
      const existing = currentTablePerms[role.id]?.[col]
      initializedPerms[role.id][col] = {
        view: existing ? existing.view : true,
        edit: existing ? existing.edit : false
      }
    })
  })

  tempPermData.value = initializedPerms
  activePermRole.value = 'role_employee' // 默认选中普通员工方便演示
  showColPermModal.value = true
}

function closeColPermModal() {
  showColPermModal.value = false
}

function switchPermRole(roleId) {
  activePermRole.value = roleId
}

// 逻辑处理：如果取消了"可见"，则"可编辑"也必须取消
function handleViewChange(col) {
  const roleData = tempPermData.value[activePermRole.value]
  if (!roleData[col].view) {
    roleData[col].edit = false
  }
}

// 全选/反选 辅助函数
function toggleAllPerms(type) { // type = 'view' | 'edit'
  const roleData = tempPermData.value[activePermRole.value]
  const columns = selectedTable.value.allColumns

  // 检查是否全选了
  const allChecked = columns.every(col => roleData[col][type])

  columns.forEach(col => {
    roleData[col][type] = !allChecked
    // 联动逻辑
    if (type === 'view' && !roleData[col].view) {
      roleData[col].edit = false
    }
    if (type === 'edit' && roleData[col].edit) {
      roleData[col].view = true
    }
  })
}

// 保存权限
function saveColumnPermissions() {
  if (!selectedTable.value) return
  // 将 tempPermData 保存回 selectedTable
  selectedTable.value.columnPermissions = JSON.parse(JSON.stringify(tempPermData.value))
  alert(`"${selectedTable.value.name}" 的列级权限配置已保存！\n\n(提示：实际生效需要结合后端API鉴权，此处仅为前端配置演示)`)
  closeColPermModal()
}

// --- 表格数据获取 ---
function getTableData(tableId) {
  const mockData = {
    1: [
      { '项目ID': 'P001', '项目名称': '基础设施升级', '负责人': '张工', '开始时间': '2025-01-15', '预期完成时间': '2025-06-30', '状态': '进行中', '预算': '500000', '实际支出': '320000' },
      { '项目ID': 'P002', '项目名称': '数据中心迁移', '负责人': '李技术', '开始时间': '2025-02-01', '预期完成时间': '2025-07-15', '状态': '进行中', '预算': '800000', '实际支出': '450000' },
      { '项目ID': 'P003', '项目名称': '系统安全加固', '负责人': '王经理', '开始时间': '2025-01-20', '预期完成时间': '2025-05-30', '状态': '已完成', '预算': '300000', '实际支出': '290000' }
    ],
    2: [
      { '员工ID': 'E001', '员工名称': '张工', '部门': '技术部', '月份': '2025-11', '绩效评分': '95', '备注': '表现优秀' },
      { '员工ID': 'E002', '员工名称': '李技术', '部门': '技术部', '月份': '2025-11', '绩效评分': '88', '备注': '表现良好' },
      { '员工ID': 'E003', '员工名称': '王经理', '部门': '项目部', '月份': '2025-11', '绩效评分': '92', '备注': '表现优秀' }
    ],
    3: [
      { '部门': '技术部', '预算总额': '2000000', '已支出': '1200000', '预留': '500000', '年份': '2025', '审批状态': '已批准', '负责人': '张工' },
      { '部门': '项目部', '预算总额': '1500000', '已支出': '900000', '预留': '400000', '年份': '2025', '审批状态': '已批准', '负责人': '王经理' },
      { '部门': '财务部', '预算总额': '1000000', '已支出': '600000', '预留': '300000', '年份': '2025', '审批状态': '已批准', '负责人': '李财务' }
    ],
    4: [
      { '客户ID': 'C001', '客户名称': '阿里巴巴', '行业': '电子商务', '联系电话': '010-1234567', '地址': '北京市', '合作状态': '合作中', '合同金额': '2000000', '业务负责人': '陈经理', '最后联系时间': '2025-12-08' },
      { '客户ID': 'C002', '客户名称': '腾讯', '行业': '互联网', '联系电话': '0755-2345678', '地址': '深圳市', '合作状态': '合作中', '合同金额': '3000000', '业务负责人': '关主任', '最后联系时间': '2025-12-07' },
      { '客户ID': 'C003', '客户名称': '字节跳动', '行业': '互联网', '联系电话': '010-3456789', '地址': '北京市', '合作状态': '洽谈中', '合同金额': '1500000', '业务负责人': '陈经理', '最后联系时间': '2025-12-08' }
    ]
  }
  return mockData[tableId] || []
}

function exportTableData(tableId) {
  const table = tables.value.find(t => t.id === tableId)
  if (!table) return
  const data = getTableData(tableId)
  const csvContent = [
    table.allColumns.map(col => `"${col}"`).join(','),
    ...data.map(row =>
        table.allColumns.map(col => {
          const value = row[col] || ''
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
    )
  ].join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${table.name}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  alert(`已导出 "${table.name}" 数据`)
}

function exportProjectData(projectId) {
  const project = projects.value.find(p => p.id === projectId)
  if (!project) return
  const csvContent = `项目导出\n项目名称: ${project.name}\n部门: ${project.department}\n导出时间: ${new Date().toLocaleString('zh-CN')}\n\n成员列表:\n姓名,角色\n${projectMembers.value.map(m => `${m.name},${m.role}`).join('\n')}`
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${project.name}_权限设置_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  alert(`已导出 "${project.name}" 项目权限设置数据`)
}

function importTableData(tableId) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.csv, text/csv'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      alert(`已选择文件: ${file.name}\n文件大小: ${Math.round(file.size / 1024)}KB\n\n注意：演示版本，实际导入功能需要后端支持`)
    }
  }
  input.click()
}

function importTableDataForProject(projectId) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.csv, text/csv'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      alert(`已选择文件: ${file.name}\n文件大小: ${Math.round(file.size / 1024)}KB\n\n将导入到项目: ${projects.value.find(p => p.id === projectId)?.name}`)
    }
  }
  input.click()
}

function selectApplication(app) {
  selectedApplication.value = app
  approvalComment.value = ''
}

function approveApplication() {
  if (!approvalComment.value || approvalComment.value.length < 20) {
    alert('请输入至少20个字的审批意见')
    return
  }
  if (selectedApplication.value) {
    selectedApplication.value.status = 'approved'
    approvalComment.value = ''
    alert('已批准申请')
  }
}

function rejectApplication() {
  if (!approvalComment.value || approvalComment.value.length < 20) {
    alert('请输入至少20个字的审批意见')
    return
  }
  if (selectedApplication.value) {
    selectedApplication.value.status = 'rejected'
    approvalComment.value = ''
    alert('已拒绝申请')
  }
}

// 表格编辑相关函数
const isEditingTable = ref(false)
const editingTableData = ref({})
const changedRows = ref([])

function startEditingTable() {
  isEditingTable.value = true
  editingTableData.value = {}
  changedRows.value = []
  showTableMenu.value = false
}

function toggleTableMenu() {
  showTableMenu.value = !showTableMenu.value
}

function showTableDetails() {
  alert('表格详情：' + selectedTable.value.name + '\n所有者：' + selectedTable.value.owner + '\n行数：' + selectedTable.value.rows + '\n列数：' + selectedTable.value.columns)
  showTableMenu.value = false
}

function deleteTable() {
  if (confirm('确定要删除表格 "' + selectedTable.value.name + '" 吗？此操作无法撤销。')) {
    const index = tables.value.findIndex(t => t.id === selectedTableId.value)
    if (index > -1) {
      tables.value.splice(index, 1)
      selectedTableId.value = tables.value[0]?.id || null
      alert('表格已删除')
    }
  }
  showTableMenu.value = false
}

function goToDataSync() {
  currentTab.value = 'dataSync'
  selectedPRId.value = null
}

function goToDataSyncForProject(projectId) {
  currentTab.value = 'dataSync'
  selectedPRId.value = null
}

// 冲突检测逻辑
function checkForConflicts(currentPr) {
  const otherPendingPrs = pullRequests.value.filter(
      pr => pr.status === 'pending' &&
          pr.id !== currentPr.id &&
          pr.tableId === currentPr.tableId
  )
  if (otherPendingPrs.length === 0) return null

  for (const myChange of currentPr.changes) {
    for (const otherPr of otherPendingPrs) {
      for (const otherChange of otherPr.changes) {
        if (myChange.rowIdx === otherChange.rowIdx && myChange.column === otherChange.column) {
          return { conflictingPr: otherPr }
        }
      }
    }
  }
  return null
}

function mergePullRequest() {
  if (!selectedPR.value) return
  const conflictResult = checkForConflicts(selectedPR.value)
  if (conflictResult) {
    conflictPrData.value = conflictResult.conflictingPr
    const overlaps = []
    const myOverlaps = []
    selectedPR.value.changes.forEach(mc => {
      const match = conflictResult.conflictingPr.changes.find(
          oc => oc.rowIdx === mc.rowIdx && oc.column === mc.column
      )
      if (match) {
        myOverlaps.push(mc)
        overlaps.push(match)
      }
    })
    currentConflictChanges.value = myOverlaps
    conflictPrChanges.value = overlaps
    showConflictModal.value = true
    return
  }
  performMerge(selectedPR.value)
}

function performMerge(pr) {
  pr.status = 'merged'
  alert(`请求 #${pr.id} 已合并，表格数据已更新`)
  selectedPRId.value = null
  showConflictModal.value = false
}

function resolveConflict(action) {
  if (!selectedPR.value || !conflictPrData.value) return
  if (action === 'merge_current') {
    selectedPR.value.status = 'merged'
    conflictPrData.value.status = 'rejected'
    alert(`已合并当前请求 #${selectedPR.value.id}，并自动拒绝了冲突请求 #${conflictPrData.value.id}`)
  } else if (action === 'reject_current') {
    selectedPR.value.status = 'rejected'
    alert(`已拒绝当前请求 #${selectedPR.value.id}，保留了冲突请求 #${conflictPrData.value.id} 待审核`)
  } else if (action === 'reject_all') {
    selectedPR.value.status = 'rejected'
    conflictPrData.value.status = 'rejected'
    alert('已同时拒绝两个产生冲突的请求')
  }
  selectedPRId.value = null
  showConflictModal.value = false
  conflictPrData.value = null
}

function closeConflictModal() {
  showConflictModal.value = false
}

function rejectPullRequest() {
  if (selectedPR.value) {
    selectedPR.value.status = 'rejected'
    alert('编辑请求已拒绝')
    selectedPRId.value = null
  }
}

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

function submitTableChangesForReview() {
  if (changedRows.value.length === 0) {
    alert('没有任何修改')
    return
  }
  const changesSummary = changedRows.value.map(rowIdx => {
    const changes = []
    for (let col of selectedTable.value.allColumns) {
      const key = rowIdx + '-' + col
      if (editingTableData.value[key] !== undefined) {
        const originalData = getTableData(selectedTableId.value)
        const oldValue = originalData[rowIdx][col] || ''
        const newValue = editingTableData.value[key]
        if (oldValue !== newValue) {
          changes.push(`${col}: ${oldValue} → ${newValue}`)
        }
      }
    }
    return `第 ${rowIdx + 1} 行: ${changes.join(', ')}`
  }).join('\n')
  const summary = `已修改 ${changedRows.value.length} 行\n${changesSummary}`
  alert('变更内容:\n' + summary + '\n已提交审核请求')

  const newPR = {
    id: pullRequests.value.length + 1,
    tableId: selectedTableId.value,
    tableName: selectedTable.value.name,
    description: summary,
    submitter: '当前用户',
    submitTime: new Date().toLocaleString('zh-CN'),
    status: 'pending',
    proofFiles: [],
    changes: changedRows.value.map((rowIdx) => {
      const col = selectedTable.value.allColumns[0];
      return {
        type: 'modify',
        rowIdx: rowIdx,
        column: col,
        oldValue: '演示数据',
        newValue: editingTableData.value[`${rowIdx}-${col}`] || '新值'
      }
    })
  }
  pullRequests.value.push(newPR)
  isEditingTable.value = false
  editingTableData.value = {}
  changedRows.value = []
}

function cancelTableEdit() {
  if (changedRows.value.length > 0 && !confirm('确定要放弃所有修改吗？')) {
    return
  }
  isEditingTable.value = false
  editingTableData.value = {}
  changedRows.value = []
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
</style>