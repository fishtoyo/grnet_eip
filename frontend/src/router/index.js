import { createRouter, createWebHistory } from 'vue-router';
import DefaultLayout from '../layouts/DefaultLayout.vue';
import LeaveSystem from '../views/LeaveSystem.vue';

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', component: LeaveSystem },
    ],
  },
];

const router = createRouter({
  history: createWebHistory('/grnet_eip/'), // 對應 GitHub Pages 的路徑
  routes,
});

export default router;