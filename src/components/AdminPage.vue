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
        <button class="flex items-center text-indigo-600 hover:text-indigo-800" @click="showApplicationList = true">
          <iconify-icon class="mr-1 text-xl" icon="mdi:clipboard-list-outline"></iconify-icon>
          申请管理
        </button>
        <button class="flex items-center text-indigo-600 hover:text-indigo-800" @click="openSyncChangesModal">
          <iconify-icon class="mr-1 text-xl" icon="mdi:cloud-sync-outline"></iconify-icon>
          同步变更窗口
        </button>
        <div class="flex items-center space-x-2 py-1">
          <div class="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10"></div>
          <span class="font-medium text-gray-700">管理员</span>
        </div>
        <router-link to="/operator" class="text-indigo-600 hover:text-indigo-800 ml-4">
          操作者视图
        </router-link>
      </div>
    </header>

    <div class="flex p-6">
      <!-- 左侧筛选面板 -->
      <aside class="w-72 bg-white rounded-xl shadow p-5 mr-6 h-fit sticky top-24">
        <h2 class="font-semibold text-gray-800 mb-4">筛选条件</h2>
        
        <div class="mb-5">
          <h3 class="text-sm font-medium text-gray-700 mb-2">SOP分类</h3>
          <div class="space-y-1">
            <label v-for="category in categories" :key="category" class="flex items-center">
              <input class="mr-2 h-4 w-4 accent-indigo-600" type="checkbox" />
              <span class="text-gray-600">{{ category }}</span>
            </label>
          </div>
        </div>

        <div class="mb-5">
          <h3 class="text-sm font-medium text-gray-700 mb-2">状态过滤</h3>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="status in statuses" :key="status.name"
              :class="['py-1 px-3 rounded-md text-sm', status.class]">
              {{ status.name }}
            </button>
          </div>
        </div>

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
        <!-- 标签页导航 -->
        <div class="flex border-b border-gray-200 mb-6">
          <button 
            v-for="tab in tabs" :key="tab.id"
            @click="currentTab = tab.id"
            :class="['px-4 py-2 font-medium relative', 
              currentTab === tab.id 
                ? 'text-indigo-700 border-b-2 border-indigo-600' 
                : 'text-gray-600 hover:text-indigo-700']">
            {{ tab.label }}
          </button>
        </div>

        <!-- 申请列表页面 -->
        <div v-if="currentTab === 'applicationList'">
          <div class="bg-white rounded-xl shadow mb-6">
            <div class="flex items-center justify-between p-5">
              <h2 class="text-xl font-bold text-gray-900">权限申请记录</h2>
              <div class="flex space-x-3">
                <button
                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">导出为Excel</button>
                <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">刷新数据</button>
              </div>
            </div>
            <div class="px-5 pb-5">
              <div class="flex items-center justify-between mb-4">
                <div class="flex space-x-3">
                  <select class="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm">
                    <option>所有申请人</option>
                    <option>管理员</option>
                    <option>张工</option>
                    <option>李技术</option>
                    <option>王经理</option>
                  </select>
                  <select class="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm">
                    <option>所有项目</option>
                    <option>I项目系统</option>
                    <option>慧人天系统</option>
                    <option>分贝通系统</option>
                  </select>
                  <select class="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm">
                    <option>所有状态</option>
                    <option>待处理</option>
                    <option>已通过</option>
                    <option>已驳回</option>
                  </select>
                </div>
                <div class="relative">
                  <input
                    class="w-64 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    placeholder="搜索申请人或项目..." type="text" />
                  <iconify-icon class="absolute right-3 top-2.5 text-gray-500" icon="mdi:magnify"></iconify-icon>
                </div>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="bg-gray-50 text-left text-gray-500 text-sm">
                      <th class="px-4 py-3 font-medium">申请人</th>
                      <th class="px-4 py-3 font-medium">申请项目</th>
                      <th class="px-4 py-3 font-medium">申请时间</th>
                      <th class="px-4 py-3 font-medium">状态</th>
                      <th class="px-4 py-3 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody class="text-sm">
                    <tr v-for="app in applications" :key="app.id" class="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                      @click="switchToApprovalWithDetails(app)">
                      <td class="px-4 py-3">
                        <div class="flex items-center">
                          <div class="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 mr-3"></div>
                          <span>{{ app.applicant }}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3">{{ app.project }}</td>
                      <td class="px-4 py-3">{{ app.timestamp }}</td>
                      <td class="px-4 py-3">
                        <span :class="['px-2 py-1 rounded text-xs', app.statusClass]">
                          {{ app.status }}
                        </span>
                      </td>
                      <td class="px-4 py-3">
                        <button class="text-indigo-600 hover:text-indigo-800 text-sm"
                          @click.stop="switchToApprovalWithDetails(app)">
                          {{ app.status === '待处理' ? '审批' : '查看' }}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- 审批详情页面 -->
        <div v-if="currentTab === 'approvalPage'" class="flex gap-6">
          <div class="w-2/3 bg-white rounded-xl shadow">
            <div class="p-5 border-b border-gray-200">
              <h2 class="text-xl font-bold text-gray-900">申请详情</h2>
            </div>
            <div class="p-5 space-y-6">
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-2">申请人</h3>
                <div class="flex items-center">
                  <div class="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mr-4"></div>
                  <div>
                    <p class="font-medium">{{ selectedApplication?.applicant }}</p>
                    <p class="text-sm text-gray-600">{{ getDepartment(selectedApplication?.applicant) }}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-2">申请项目</h3>
                <p class="font-medium">{{ selectedApplication?.project }}</p>
                <p class="text-gray-600 mt-2">{{ selectedApplication?.description }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-2">申请原因</h3>
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p class="text-gray-700">{{ selectedApplication?.reason }}</p>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-2">相关附件</h3>
                <div class="flex items-center p-3 border border-gray-200 rounded-lg">
                  <iconify-icon class="text-blue-500 text-2xl mr-3" icon="mdi:file-document-outline"></iconify-icon>
                  <div>
                    <p class="text-sm font-medium">系统升级方案_V1.2.pdf</p>
                    <p class="text-xs text-gray-500">3.2MB</p>
                  </div>
                  <button class="ml-auto text-indigo-600 text-sm font-medium">预览</button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex-1 bg-white rounded-xl shadow">
            <div class="p-5 border-b border-gray-200">
              <h2 class="text-xl font-bold text-gray-900">审批操作</h2>
            </div>
            <div class="p-5 space-y-5">
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-3">审批状态</h3>
                <div class="flex items-center justify-between mb-4">
                  <span :class="['px-3 py-1 rounded-full text-sm font-medium', selectedApplication?.statusClass]">
                    {{ selectedApplication?.status }}
                  </span>
                  <p class="text-sm text-gray-500">申请时间: {{ selectedApplication?.timestamp }}</p>
                </div>
                <div class="border-l-2 border-gray-200 ml-4 pl-4 space-y-4 py-2">
                  <div>
                    <div class="flex items-center">
                      <div class="w-4 h-4 rounded-full bg-indigo-600 -ml-[15px]"></div>
                      <p class="ml-2 text-sm font-medium">申请提交</p>
                    </div>
                    <p class="text-xs text-gray-500 mt-1 ml-6">{{ selectedApplication?.timestamp }}</p>
                  </div>
                  <div :class="['opacity-50', selectedApplication?.status === '待处理' ? 'opacity-50' : 'opacity-100']">
                    <div class="flex items-center">
                      <div :class="['w-4 h-4 rounded-full -ml-[15px]', 
                        selectedApplication?.status !== '待处理' ? 'bg-indigo-600' : 'bg-gray-200 border-2 border-gray-300']"></div>
                      <p class="ml-2 text-sm font-medium">负责人审批</p>
                    </div>
                  </div>
                  <div :class="['opacity-50', selectedApplication?.status === '已通过' ? 'opacity-100' : 'opacity-50']">
                    <div class="flex items-center">
                      <div :class="['w-4 h-4 rounded-full -ml-[15px]', 
                        selectedApplication?.status === '已通过' ? 'bg-indigo-600' : 'bg-gray-200 border-2 border-gray-300']"></div>
                      <p class="ml-2 text-sm font-medium">技术审核</p>
                    </div>
                  </div>
                  <div :class="['opacity-50', selectedApplication?.status === '已通过' ? 'opacity-100' : 'opacity-50']">
                    <div class="flex items-center">
                      <div :class="['w-4 h-4 rounded-full -ml-[15px]', 
                        selectedApplication?.status === '已通过' ? 'bg-indigo-600' : 'bg-gray-200 border-2 border-gray-300']"></div>
                      <p class="ml-2 text-sm font-medium">完成执行</p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="selectedApplication?.status === '待处理'">
                <h3 class="text-sm font-medium text-gray-500 mb-2">审批意见 <span class="text-red-500">*</span></h3>
                <textarea
                  v-model="approvalComment"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="请输入审批意见（至少20字）" rows="3"></textarea>
                <p class="text-xs text-gray-500 mt-1">{{ approvalComment.length }}/200 字</p>

                <div class="flex gap-3 mt-4">
                  <button
                    class="flex-1 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
                    @click="rejectApplication">驳回</button>
                  <button
                    class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    @click="approveApplication">通过</button>
                </div>
              </div>

              <div v-else class="text-center py-8">
                <p class="text-gray-600">此申请已处理，不可再进行操作</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 权限设置页面 -->
        <div v-if="currentTab === 'permissionSetting'" class="flex gap-6">
          <div class="w-1/3 bg-white rounded-xl shadow">
            <div class="p-5 border-b border-gray-200">
              <div class="flex justify-between items-center">
                <h2 class="font-bold text-gray-900">项目列表</h2>
                <button class="text-sm text-blue-600 font-medium">新建项目</button>
              </div>
            </div>
            <div class="p-3">
              <div class="relative">
                <input
                  class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="搜索项目..." type="text" />
                <iconify-icon class="absolute right-3 top-2.5 text-gray-500" icon="mdi:magnify"></iconify-icon>
              </div>
              <div class="mt-4 space-y-2">
                <div v-for="project in projects" :key="project.id"
                  class="group flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 cursor-pointer"
                  @click="selectedProjectId = project.id">
                  <div>
                    <p class="font-medium">{{ project.name }}</p>
                    <p class="text-xs text-gray-500">{{ project.department }}</p>
                  </div>
                  <iconify-icon class="text-gray-400 group-hover:text-blue-600" icon="mdi:chevron-right"></iconify-icon>
                </div>
              </div>
            </div>
          </div>

          <div class="flex-1 bg-white rounded-xl shadow">
            <div class="p-5 border-b border-gray-200">
              <h2 class="font-bold text-gray-900">项目权限设置</h2>
            </div>
            <div class="p-5 space-y-6">
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
                        <td class="px-4 py-3">
                          <iconify-icon v-if="perm.editor" class="text-green-500 text-xl" icon="mdi:check-circle"></iconify-icon>
                          <iconify-icon v-else class="text-gray-300 text-xl" icon="mdi:close-circle"></iconify-icon>
                        </td>
                        <td class="px-4 py-3">
                          <iconify-icon v-if="perm.viewer" class="text-green-500 text-xl" icon="mdi:check-circle"></iconify-icon>
                          <iconify-icon v-else class="text-gray-300 text-xl" icon="mdi:close-circle"></iconify-icon>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const searchQuery = ref('')
const showSyncModal = ref(false)
const currentTab = ref('applicationList')
const showApplicationList = ref(false)
const approvalComment = ref('')
const selectedProjectId = ref(1)

const categories = ['系统更新', '配置变更', '数据迁移']
const priorities = ['高优先级', '中优先级', '低优先级']
const statuses = [
  { name: '待处理', class: 'bg-yellow-100 text-yellow-800' },
  { name: '进行中', class: 'bg-blue-100 text-blue-800' },
  { name: '已完成', class: 'bg-green-100 text-green-800' },
  { name: '已中止', class: 'bg-red-100 text-red-800' }
]

const tabs = [
  { id: 'applicationList', label: '申请列表' },
  { id: 'approvalPage', label: '审批详情' },
  { id: 'permissionSetting', label: '权限设置' }
]

const applications = ref([
  {
    id: 1,
    applicant: '张工',
    project: '更新I项目系统',
    timestamp: '2025-11-24 09:45',
    status: '待处理',
    statusClass: 'bg-yellow-100 text-yellow-800',
    description: '更新项目管理系统至最新版本，包括数据库迁移和接口配置',
    reason: '由于系统老旧导致性能瓶颈，需升级到最新版本以支持更大规模的数据处理能力。'
  },
  {
    id: 2,
    applicant: '王经理',
    project: '更新慧人天系统',
    timestamp: '2025-11-23 14:20',
    status: '进行中',
    statusClass: 'bg-blue-100 text-blue-800',
    description: '人力资源系统配置更新，包括员工权限调整和流程优化',
    reason: '为了满足人力资源管理的新需求，需要更新系统功能。'
  },
  {
    id: 3,
    applicant: '李技术',
    project: '更新分贝通系统',
    timestamp: '2025-11-22 16:30',
    status: '已完成',
    statusClass: 'bg-green-100 text-green-800',
    description: '费用管理系统升级，集成新支付接口和审批流程',
    reason: '财务系统需要更新以支持新的支付渠道和报销流程。'
  },
  {
    id: 4,
    applicant: '管理员',
    project: '修改企业微信群',
    timestamp: '2025-11-21 11:15',
    status: '已驳回',
    statusClass: 'bg-red-100 text-red-800',
    description: '企业微信群需要更换管理员',
    reason: '企业微信群需要更换管理员，以确保工作沟通的连续性。'
  }
])

const selectedApplication = ref(applications.value[0])

const changeRecords = ref([
  { id: 1, filename: '系统升级方案.pdf', uploader: '张工', uploadTime: '2025-11-23 14:35', project: 'I项目系统', size: '2.4MB' },
  { id: 2, filename: '数据迁移计划.xlsx', uploader: '李技术', uploadTime: '2025-11-22 10:20', project: '分贝通系统', size: '1.2MB' },
  { id: 3, filename: '权限配置更新.doc', uploader: '王经理', uploadTime: '2025-11-21 16:45', project: '慧人天系统', size: '0.8MB' },
  { id: 4, filename: '群主交接确认.png', uploader: '管理员', uploadTime: '2025-11-20 09:15', project: '企业微信群', size: '0.5MB' },
  { id: 5, filename: '周报格式调整.docx', uploader: '助理', uploadTime: '2025-11-19 13:30', project: '周报总表', size: '0.7MB' },
  { id: 6, filename: '财务预算模板.xlsx', uploader: '财务部', uploadTime: '2025-11-18 11:05', project: '财务跟踪表', size: '1.1MB' },
  { id: 7, filename: '变更审核记录.pdf', uploader: '质量组', uploadTime: '2025-11-17 15:40', project: 'I项目系统', size: '1.8MB' }
])

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
  { id: 2, name: '变更SOP流程', admin: true, editor: true, viewer: false },
  { id: 3, name: '审批变更请求', admin: true, editor: false, viewer: false },
  { id: 4, name: '删除项目', admin: true, editor: false, viewer: false }
])

function getDepartment(applicant) {
  const deptMap = {
    '张工': '技术部',
    '王经理': '项目部',
    '李技术': '技术部',
    '管理员': '管理部门'
  }
  return deptMap[applicant] || '部门'
}

function switchToApprovalWithDetails(app) {
  selectedApplication.value = app
  currentTab.value = 'approvalPage'
  approvalComment.value = ''
}

function approveApplication() {
  if (!approvalComment.value || approvalComment.value.length < 20) {
    alert('请输入至少20个字的审批意见')
    return
  }
  selectedApplication.value.status = '已通过'
  selectedApplication.value.statusClass = 'bg-green-100 text-green-800'
  alert('已批准申请')
  approvalComment.value = ''
}

function rejectApplication() {
  if (!approvalComment.value || approvalComment.value.length < 20) {
    alert('请输入至少20个字的审批意见')
    return
  }
  selectedApplication.value.status = '已驳回'
  selectedApplication.value.statusClass = 'bg-red-100 text-red-800'
  alert('已驳回申请')
  approvalComment.value = ''
}

function openSyncChangesModal() {
  showSyncModal.value = true
}

function closeSyncChangesModal() {
  showSyncModal.value = false
}

function downloadFile(id) {
  alert(`正在下载文件(ID: ${id})...`)
}
</script>
