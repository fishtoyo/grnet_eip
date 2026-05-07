import { createRouter, createWebHistory } from 'vue-router'
import UserList from '../views/UserList.vue'
import LeaveSystem from '../views/LeaveSystem.vue'
import LeaveRecords from '../views/LeaveRecords.vue'
import Calendar from '../views/Calendar.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/calendar' // 登入後預設導向行事曆
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: Calendar
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
