import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import OperatorPage from './components/OperatorPage.vue'
import AdminPage from './components/AdminPage.vue'
import './style.css'

const routes = [
  {
    path: '/',
    redirect: '/operator'
  },
  {
    path: '/operator',
    name: 'Operator',
    component: OperatorPage
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
