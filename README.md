# 项目变更SOP清单管理系统

一个基于 Vue 3 的项目变更SOP清单管理系统，包含操作者和管理员两个完整的用户界面。

## 功能特性

### 操作者界面
- 📋 查看项目变更清单
- 🔍 搜索和筛选功能
- ✅ 完成状态标记
- 📤 上传变更文档
- 📊 同步变更窗口
- 📝 权限申请表

### 管理员界面
- 📑 申请列表管理
- ✏️ 审批详情页面
- 🔐 权限设置管理
- 👥 项目成员管理
- 📊 权限角色配置

## 项目结构

```
Prototype/
├── src/
│   ├── components/
│   │   ├── OperatorPage.vue      # 操作者页面
│   │   └── AdminPage.vue         # 管理员页面
│   ├── App.vue                   # 根组件
│   ├── main.js                   # 入口文件
│   └── style.css                 # 全局样式
├── index.html                    # HTML入口
├── package.json                  # 项目配置
├── vite.config.js               # Vite配置
├── tailwind.config.js           # Tailwind配置
└── postcss.config.js            # PostCSS配置
```

## 技术栈

- **前端框架**: Vue 3
- **路由**: Vue Router 4
- **构建工具**: Vite
- **CSS框架**: Tailwind CSS
- **图标库**: Iconify
- **CSS处理**: PostCSS & Autoprefixer

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

开发服务器会在 `http://localhost:5173` 启动

### 3. 生成生产构建

```bash
npm run build
```

生成的文件在 `dist/` 目录中

### 4. 预览生产构建

```bash
npm run preview
```

## 页面导航

- **首页**: `/` 自动重定向到操作者页面
- **操作者页面**: `/operator`
- **管理员页面**: `/admin`

## 核心功能说明

### 操作者页面
- 显示所有需要处理的项目变更项
- 支持按分类、状态、优先级和时间范围筛选
- 可以标记变更项为已完成
- 支持上传变更文档
- 可以查看同步变更历史
- 可以提交权限申请

### 管理员页面
- 查看所有权限申请记录
- 对待处理的申请进行审批
- 管理项目及其成员
- 配置权限角色
- 查看权限变更历史

## 样式特点

- 现代化设计，采用灰色+靛蓝色主题
- 响应式布局，适配不同屏幕尺寸
- 流畅的动画过渡效果
- 清晰的视觉层级

## 浏览器兼容性

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 许可证

MIT
商业与需求模式创新课外项目原型图
