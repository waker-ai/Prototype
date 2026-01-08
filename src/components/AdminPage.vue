<template>
  <div class="min-h-screen font-sans flex flex-col">
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
            class="neo-input w-64 px-4 py-2 bg-white text-black font-bold placeholder-gray-500 focus:ring-0"
            placeholder="SEARCH..." type="text" />
          <iconify-icon class="absolute right-3 top-2.5 text-black text-xl font-bold" icon="mdi:magnify"></iconify-icon>
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
          :class="['px-6 py-3 font-black text-lg transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
            currentTab === 'tableSpace'
              ? 'bg-neo-lime text-black translate-x-[2px] translate-y-[2px] shadow-none'
              : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-black']">
          <iconify-icon icon="mdi:table" class="inline mr-2"></iconify-icon>
          表格空间
        </button>
        <button @click="currentTab = 'permissions'"
          :class="['px-6 py-3 font-black text-lg transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative',
            currentTab === 'permissions'
              ? 'bg-neo-lime text-black translate-x-[2px] translate-y-[2px] shadow-none'
              : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-black']">
          <iconify-icon icon="mdi:shield-lock" class="inline mr-2"></iconify-icon>
          权限设置
          <span v-if="pendingPermissionRequests > 0" class="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold leading-none text-white bg-black border-2 border-black">{{ pendingPermissionRequests }}</span>
        </button>
        <button @click="currentTab = 'applications'"
          :class="['px-6 py-3 font-black text-lg transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative',
            currentTab === 'applications'
              ? 'bg-neo-lime text-black translate-x-[2px] translate-y-[2px] shadow-none'
              : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-black']">
          <iconify-icon icon="mdi:clipboard-check" class="inline mr-2"></iconify-icon>
          权限申请审批
          <span v-if="pendingPermissionRequests > 0" class="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold leading-none text-white bg-black border-2 border-black">{{ pendingPermissionRequests }}</span>
        </button>
        <button @click="currentTab = 'dataSync'"
          :class="['px-6 py-3 font-black text-lg transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative',
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
              <input v-model="tableSearchQuery" type="text" placeholder="SEARCH..."
                class="neo-input w-full px-4 py-2 bg-white text-black font-bold placeholder-gray-500" />
              <iconify-icon icon="mdi:magnify" class="absolute right-3 top-2.5 text-black font-bold"></iconify-icon>
            </div>
          </div>

          <!-- 表格列表 -->
          <div class="flex-1 overflow-y-auto p-0">
            <div class="space-y-0 p-0">
              <div v-for="table in filteredAdminTables" :key="table.id"
                :class="['p-4 border-b-4 border-black transition-all cursor-pointer hover:bg-neo-lime hover:pl-6',
                  selectedTableId === table.id
                    ? 'bg-black text-white hover:bg-black hover:text-white'
                    : 'bg-white text-black']"
                @click="selectedTableId = table.id">
                <h3 class="font-black text-lg uppercase">{{ table.name }}</h3>
                <p :class="['text-xs font-bold mt-1 line-clamp-2', selectedTableId === table.id ? 'text-gray-300' : 'text-gray-600']">{{ table.description }}</p>
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
              <div class="flex items-center space-x-4">
                <button @click="startEditingTable" class="neo-btn px-4 py-2 flex items-center space-x-2 text-black hover:bg-white hover:text-black">
                  <iconify-icon icon="mdi:pencil" class="text-xl"></iconify-icon>
                  <span class="text-sm font-black">编辑</span>
                </button>
                <button @click="goToDataSync" class="neo-btn px-4 py-2 flex items-center space-x-2 text-black hover:bg-white hover:text-black">
                  <iconify-icon icon="mdi:cloud-sync" class="text-xl"></iconify-icon>
                  <span class="text-sm font-black">数据同步</span>
                </button>
                <button @click="exportTableData(selectedTableId)" class="neo-btn px-4 py-2 flex items-center space-x-2 text-black hover:bg-white hover:text-black">
                  <iconify-icon icon="mdi:download" class="text-xl"></iconify-icon>
                  <span class="text-sm font-black">导出</span>
                </button>
                <div class="relative">
                  <button @click="toggleTableMenu" class="neo-btn-secondary px-3 py-2 flex items-center bg-white text-black">
                    <iconify-icon icon="mdi:dots-vertical" class="text-xl"></iconify-icon>
                  </button>
                  <div v-if="showTableMenu" class="absolute right-0 top-full mt-2 bg-white border-4 border-black shadow-neo z-50 min-w-48">
                    <button @click="showTableDetails" class="w-full text-left px-4 py-3 text-black font-bold hover:bg-neo-lime border-b-2 border-black flex items-center">
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
            <div v-if="!isEditingTable" class="flex-1 overflow-auto p-6 bg-white">
              <table class="w-full text-sm border-collapse border-4 border-black">
                <thead class="bg-neo-yellow sticky top-0 z-0">
                  <tr>
                    <th v-for="col in selectedTable.allColumns" :key="col"
                      class="px-4 py-3 text-left font-black text-black border-2 border-black uppercase text-xs tracking-wider">
                      {{ col }}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white">
                  <tr v-for="(row, idx) in getTableData(selectedTableId)" :key="idx"
                    class="hover:bg-neo-lime transition-colors">
                    <td v-for="col in selectedTable.allColumns" :key="col"
                      class="px-4 py-3 text-black font-medium border-2 border-black">
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
              <table class="w-full text-sm border-collapse border-4 border-black bg-white shadow-neo">
                <thead class="bg-black text-white sticky top-0">
                  <tr>
                    <th v-for="col in selectedTable.allColumns" :key="col"
                      class="px-4 py-3 text-left font-black border-2 border-white uppercase">
                      {{ col }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in getTableData(selectedTableId)" :key="idx"
                    :class="['border-2 border-black', changedRows.includes(idx) ? 'bg-neo-pink' : 'bg-white hover:bg-gray-100']">
                    <td v-for="col in selectedTable.allColumns" :key="col"
                      class="px-0 py-0 border-2 border-black">
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
                        class="w-full px-4 py-3 border-0 focus:ring-0 focus:outline-none bg-transparent font-mono font-bold"
                        :class="changedRows.includes(idx) ? 'text-white placeholder-white' : 'text-black'"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="mt-6 flex gap-4">
                <button @click="submitTableChangesForReview"
                  class="neo-btn px-6 py-3 text-black hover:bg-white">
                  提交审核
                </button>
                <button @click="cancelTableEdit"
                  class="neo-btn-secondary px-6 py-3 bg-white text-black hover:bg-black hover:text-white">
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

      <!-- 管理标签页 -->
      <template v-else-if="currentTab === 'management'">
        <!-- 左侧筛选面板 -->
        <aside class="w-80 bg-white border-4 border-black shadow-neo flex flex-col m-6 mr-3">
          <div class="border-b-4 border-black p-4 bg-neo-yellow">
            <h2 class="text-xl font-black text-black uppercase">管理选项</h2>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div class="space-y-0 p-0">
              <button @click="managementTab = 'applications'"
                :class="['w-full text-left px-4 py-4 transition-all border-b-2 border-black font-bold uppercase',
                  managementTab === 'applications'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-neo-lime']">
                <iconify-icon icon="mdi:clipboard-check" class="inline mr-2"></iconify-icon>
                权限申请审批
              </button>
              <button @click="managementTab = 'tableEdit'"
                :class="['w-full text-left px-4 py-4 transition-all border-b-2 border-black font-bold uppercase',
                  managementTab === 'tableEdit'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-neo-lime']">
                <iconify-icon icon="mdi:pencil-multiple" class="inline mr-2"></iconify-icon>
                编辑变更审核
              </button>
              <button @click="managementTab = 'versions'"
                :class="['w-full text-left px-4 py-4 transition-all border-b-2 border-black font-bold uppercase',
                  managementTab === 'versions'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-neo-lime']">
                <iconify-icon icon="mdi:history" class="inline mr-2"></iconify-icon>
                变更历史
              </button>
            </div>
          </div>
        </aside>

        <!-- 右侧内容区域 -->
        <div class="flex-1 bg-white border-4 border-black shadow-neo flex flex-col m-2 ml-3 overflow-hidden">
          <!-- 权限申请审批 -->
          <template v-if="managementTab === 'applications'">
            <div class="border-b-4 border-black p-6 bg-neo-yellow">
              <h2 class="text-3xl font-black text-black uppercase">权限申请审批</h2>
              <p class="text-black font-bold mt-1">审核所有操作者的权限申请</p>
            </div>

            <div class="flex-1 overflow-auto p-6 bg-white">
              <div class="space-y-4">
                <div v-for="app in applications" :key="app.id"
                  class="border-4 border-black shadow-neo p-4 hover:bg-neo-lime transition-all cursor-pointer bg-white"
                  @click="selectApplication(app)">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                      <h3 class="font-black text-xl text-black uppercase">{{ app.tableName }}</h3>
                      <p class="text-sm text-black font-bold mt-1">申请人: {{ app.applicant }}</p>
                    </div>
                    <span :class="['px-3 py-1 font-black border-2 border-black text-xs uppercase shadow-neo-sm',
                      app.status === 'pending' ? 'bg-neo-yellow text-black' :
                      app.status === 'approved' ? 'bg-neo-lime text-black' :
                      'bg-neo-pink text-white']">
                      {{ app.status === 'pending' ? '待审批' : app.status === 'approved' ? '已批准' : '已拒绝' }}
                    </span>
                  </div>
                  <p class="text-sm text-black font-medium mb-2 border-l-4 border-black pl-2">{{ app.reason }}</p>
                  <p class="text-xs text-black font-mono">{{ app.submitTime }}</p>
                </div>
              </div>
            </div>
          </template>

          <!-- 编辑变更审核 -->
          <template v-else-if="managementTab === 'tableEdit'">
            <div class="border-b-4 border-black p-6 bg-neo-pink">
              <h2 class="text-3xl font-black text-white uppercase">编辑变更审核</h2>
              <p class="text-white font-bold mt-1">审核操作者对表格的编辑变更</p>
            </div>
            <div class="flex-1 overflow-auto p-6 bg-white">
              <div class="border-4 border-black border-dashed p-12 bg-gray-50">
                <p class="text-black font-black text-2xl text-center uppercase">Work In Progress...</p>
              </div>
            </div>
          </template>

          <!-- 变更历史 -->
          <template v-else-if="managementTab === 'versions'">
            <div class="border-b-4 border-black p-6 bg-black text-white">
              <h2 class="text-3xl font-black uppercase">变更历史</h2>
              <p class="text-gray-400 font-bold mt-1">查看所有表格的变更历史记录</p>
            </div>
            <div class="flex-1 overflow-auto p-6 bg-white">
              <div class="border-4 border-black border-dashed p-12 bg-gray-50">
                <p class="text-black font-black text-2xl text-center uppercase">Work In Progress...</p>
              </div>
            </div>
          </template>
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
                :class="['p-4 border-b-2 border-black transition-all cursor-pointer hover:bg-neo-lime',
                  selectedProjectId === project.id
                    ? 'bg-black text-white'
                    : 'bg-white text-black']"
                @click="selectedProjectId = project.id">
                <h3 class="font-black text-lg uppercase">{{ project.name }}</h3>
                <p class="text-xs font-bold mt-1 opacity-80">{{ project.department }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 bg-white border-4 border-black shadow-neo flex flex-col m-2 ml-3">
          <div class="border-b-4 border-black p-6 flex items-center justify-between bg-white">
            <div>
              <h2 class="text-3xl font-black text-black uppercase">项目权限设置</h2>
            </div>
            <!-- 通知气泡 -->
            <div v-if="showPermissionBubble && pendingPermissionRequests > 0" class="relative">
              <div class="absolute -top-4 -right-2 inline-flex items-center justify-center px-4 py-2 text-xs font-black leading-none text-white bg-neo-pink border-2 border-black shadow-neo-sm transform rotate-3">
                <iconify-icon icon="mdi:bell" class="mr-1"></iconify-icon>
                有 {{ pendingPermissionRequests }} 个待审批的权限请求
              </div>
            </div>
          </div>
          <div class="flex-1 overflow-auto p-6 space-y-6 bg-white">
            <div>
              <h3 class="font-black text-black text-xl mb-3 border-l-8 border-neo-lime pl-2 uppercase">项目成员管理</h3>
              <div class="border-2 border-black p-4 bg-neo-white shadow-neo-sm">
                <div class="flex items-center justify-between mb-4">
                  <p class="text-sm font-bold uppercase">成员列表</p>
                  <button class="text-black text-sm font-black border-2 border-black px-2 py-1 bg-neo-lime hover:bg-white shadow-neo-sm uppercase">添加成员</button>
                </div>
                <div class="flex flex-wrap gap-3">
                  <div v-for="member in projectMembers" :key="member.id" class="flex items-center bg-white px-3 py-2 border-2 border-black shadow-neo-sm">
                    <div class="bg-black border-2 border-white rounded-none w-8 h-8 mr-2"></div>
                    <span class="mr-2 font-bold">{{ member.name }}</span>
                    <span :class="['text-xs px-2 py-0.5 font-bold border border-black', member.roleClass]">
                      {{ member.role }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="font-black text-black text-xl mb-3 border-l-8 border-neo-lime pl-2 uppercase">权限角色配置</h3>
              <div class="overflow-x-auto border-4 border-black shadow-neo">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-black text-white text-left uppercase">
                      <th class="px-4 py-3 font-black">功能权限</th>
                      <th class="px-4 py-3 font-black">管理员</th>
                      <th class="px-4 py-3 font-black">编辑者</th>
                      <th class="px-4 py-3 font-black">查看者</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="perm in permissions" :key="perm.id" class="border-b-2 border-black hover:bg-neo-lime bg-white">
                      <td class="px-4 py-3 font-bold border-r-2 border-black">{{ perm.name }}</td>
                      <td class="px-4 py-3 border-r-2 border-black text-center">
                        <iconify-icon v-if="perm.admin" class="text-black text-xl" icon="mdi:check-bold"></iconify-icon>
                        <iconify-icon v-else class="text-gray-300 text-xl" icon="mdi:close-thick"></iconify-icon>
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
                :class="['p-4 border-b-2 border-black transition-all cursor-pointer hover:bg-neo-lime',
                  selectedApplication?.id === app.id
                    ? 'bg-black text-white'
                    : 'bg-white text-black']"
                @click="selectedApplication = app">
                <h3 class="font-black text-sm uppercase">{{ app.tableName }}</h3>
                <p class="text-xs font-bold mt-1 opacity-80">申请人: {{ app.applicant }}</p>
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

        <div class="flex-1 bg-white border-4 border-black shadow-neo flex flex-col m-2 ml-3">
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

              <div v-if="selectedApplication.status === 'pending'" class="pt-4 border-t-4 border-black">
                <h3 class="text-sm font-black text-black mb-3 uppercase">审批操作</h3>
                <textarea v-model="approvalComment"
                  placeholder="请输入审批意见（至少20字）..."
                  class="w-full px-3 py-2.5 border-4 border-black font-bold focus:outline-none bg-white text-sm resize-none h-24 mb-3 shadow-neo-sm"
                ></textarea>
                <p class="text-xs text-black font-bold mb-4 bg-neo-lime inline-block px-1 border border-black">{{ approvalComment.length }}/200 字</p>
                <div class="flex gap-4">
                  <button @click="rejectApplication"
                    class="flex-1 px-4 py-3 bg-white border-2 border-black shadow-neo text-black font-black uppercase hover:bg-neo-pink hover:text-white transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                    拒绝
                  </button>
                  <button @click="approveApplication"
                    class="flex-1 px-4 py-3 bg-neo-lime border-2 border-black shadow-neo text-black font-black uppercase hover:bg-white transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
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

      <!-- 数据同步标签页（Pull Request风格） -->
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
              <input v-model="prSearchQuery" type="text" placeholder="SEARCH PR..."
                class="neo-input w-full px-4 py-2 bg-white text-black font-bold placeholder-gray-500" />
              <iconify-icon icon="mdi:magnify" class="absolute right-3 top-2.5 text-black font-bold"></iconify-icon>
            </div>
            <div class="flex gap-2">
              <button @click="prStatusFilter = null"
                :class="['px-3 py-1 font-black border-2 border-black text-xs uppercase transition-all',
                  prStatusFilter === null
                    ? 'bg-black text-white shadow-none translate-x-[1px] translate-y-[1px]'
                    : 'bg-white text-black shadow-neo-sm hover:bg-gray-100']">
                全部
              </button>
              <button @click="prStatusFilter = 'pending'"
                :class="['px-3 py-1 font-black border-2 border-black text-xs uppercase transition-all',
                  prStatusFilter === 'pending'
                    ? 'bg-neo-yellow text-black shadow-none translate-x-[1px] translate-y-[1px]'
                    : 'bg-white text-black shadow-neo-sm hover:bg-neo-yellow']">
                待审批
              </button>
              <button @click="prStatusFilter = 'merged'"
                :class="['px-3 py-1 font-black border-2 border-black text-xs uppercase transition-all',
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
                :class="['p-4 border-b-2 border-black transition-all cursor-pointer hover:bg-neo-lime',
                  selectedPRId === pr.id
                    ? 'bg-black text-white'
                    : 'bg-white text-black']"
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

                <!-- 变更详情 -->
                <div>
                  <h3 class="text-lg font-black text-black mb-3 uppercase border-l-8 border-neo-pink pl-2">变更详情</h3>
                  <div class="space-y-3">
                    <div v-for="(change, index) in selectedPR.changes" :key="index"
                      class="bg-white border-2 border-black p-4 space-y-2 shadow-neo-sm">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                          <span v-if="change.type === 'modify'"
                            class="inline-block px-2 py-0.5 bg-neo-yellow border border-black text-black text-xs font-black uppercase rounded-none">
                            修改
                          </span>
                          <span v-else-if="change.type === 'add'"
                            class="inline-block px-2 py-0.5 bg-neo-lime border border-black text-black text-xs font-black uppercase rounded-none">
                            新增
                          </span>
                          <span v-else
                            class="inline-block px-2 py-0.5 bg-neo-pink border border-black text-white text-xs font-black uppercase rounded-none">
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
                class="flex-1 px-4 py-3 bg-neo-lime border-2 border-black shadow-neo text-black font-black uppercase hover:bg-white transition-all transform active:shadow-none active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center space-x-2">
                <iconify-icon icon="mdi:check-bold" class="text-xl"></iconify-icon>
                <span>合并</span>
              </button>
              <button @click="rejectPullRequest"
                class="flex-1 px-4 py-3 bg-neo-pink border-2 border-black shadow-neo text-white font-black uppercase hover:bg-white hover:text-black transition-all transform active:shadow-none active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center space-x-2">
                <iconify-icon icon="mdi:close-thick" class="text-xl"></iconify-icon>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentTab = ref('tableSpace')
const managementTab = ref('applications')
const searchQuery = ref('')
const tableSearchQuery = ref('')
const selectedTableId = ref(1)
const selectedProjectId = ref(1)
const selectedApplication = ref(null)
const approvalComment = ref('')

// 数据同步相关状态
const selectedPRId = ref(null)
const prSearchQuery = ref('')
const prStatusFilter = ref(null)
const showTableMenu = ref(false)

// 通知气泡状态
const showPermissionBubble = ref(true)
const showDataModifyBubble = ref(true)

// 表格数据
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

const selectedPR = computed(() => {
  return pullRequests.value.find(pr => pr.id === selectedPRId.value)
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

// 待处理权限请求
const pendingPermissions = computed(() => {
  return applications.value.filter(app => app.status === 'pending')
})

const permissionRequestCount = computed(() => {
  return pendingPermissions.value.length
})

// 给模板使用的别名
const pendingPermissionRequests = computed(() => {
  return pendingPermissions.value.length
})

// 待处理数据修改请求
const pendingPRs = computed(() => {
  return pullRequests.value.filter(pr => pr.status === 'pending')
})

const pendingPRCount = computed(() => {
  return pendingPRs.value.length
})

// 给模板使用的别名
const pendingDataChangeRequests = computed(() => {
  return pendingPRs.value.length
})

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

// Pull Request 相关函数
function mergePullRequest() {
  if (selectedPR.value) {
    selectedPR.value.status = 'merged'
    alert('编辑请求已合并，表格数据已更新')
    selectedPRId.value = null
  }
}

function rejectPullRequest() {
  if (selectedPR.value) {
    selectedPR.value.status = 'rejected'
    alert('编辑请求已拒绝')
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
  
  const summary = `已修改 ${changedRows.value.length} 行\n\n${changesSummary}`
  
  // 在这里可以显示一个模态框来选择审核人
  // 现在先模拟提交
  alert('变更内容:\n' + summary + '\n\n已提交审核请求')
  
  // 添加到pull requests
  const newPR = {
    id: pullRequests.value.length + 1,
    tableId: selectedTableId.value,
    tableName: selectedTable.value.name,
    description: summary,
    submitter: '当前用户',
    submitTime: new Date().toLocaleString('zh-CN'),
    status: 'pending',
    changes: changedRows.value.map((rowIdx, changeIdx) => ({
      type: 'modify',
      rowIdx: rowIdx,
      column: '多列修改',
      oldValue: '查看详情',
      newValue: '查看详情'
    }))
  }
  pullRequests.value.push(newPR)
  
  // 重置编辑状态
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
