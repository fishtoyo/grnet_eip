import { createRouter, createWebHistory } from 'vue-router'
import UserList from '../views/UserList.vue'
import LeaveSystem from '../views/LeaveSystem.vue'
import LeaveRecords from '../views/LeaveRecords.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/users' // 預設導向使用者列表
    },
    {
      path: '/users',
      name: 'users',
      component: UserList
    },
    {
      path: '/leave',
      name: 'leave',
      component: LeaveSystem
    },
    {
      path: '/leave-records',
      name: 'leave-records',
      component: LeaveRecords
    }
  ]
})

export default router
