<script setup>
import { ref, computed, onMounted } from 'vue'

// 預設的使用者角色 (當 API 讀取失敗時的備用資料)
const defaultUsers = [
  { id: 1, name: '老闆 A', role: '老闆', department: '管理部' },
  { id: 2, name: '會計 B', role: '會計', department: '財務部' },
  { id: 3, name: '企劃 C', role: '企劃', department: '專案部' },
  { id: 4, name: '客服 D', role: '客服', department: '客服部' },
  { id: 5, name: '設計 E', role: '視覺設計師', department: '設計部' },
  { id: 6, name: '前端 F', role: '前端工程師', department: '工程部' },
  { id: 7, name: '後端 G', role: '後端工程師', department: '工程部' }
]

const mockUsers = ref([...defaultUsers])

// 綁定下拉選單的選擇值，預設為老闆
const selectedUserId = ref(1)

// 透過 computed 動態取得目前選中的使用者完整資訊
const currentUser = computed(() => {
  return mockUsers.value.find(u => u.id === selectedUserId.value) || mockUsers.value[0]
})

// 設定選單會用到的 SVG 圖示 (Icon)
const icons = {
  calendar: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
  users: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
  leave: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  leaveRecords: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
  default: `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>`
}

// 透過 computed 依據目前登入者的「角色」，動態產生對應的左側選單
const menuItems = computed(() => {
  const role = currentUser.value.role;

  // 共用的基礎選單 (大家都有的功能)
  const commonMenus = [
    { name: '請假紀錄', path: '/leave-records', icon: icons.leaveRecords }
  ]

  switch (role) {
    case '會計':
      return [{ name: '行事曆', path: '/calendar', icon: icons.calendar }, { name: '薪資計算', path: '/payroll', icon: icons.default }, { name: '員工年資', path: '/seniority', icon: icons.users }, ...commonMenus, { name: '公司收帳', path: '/accounts-receivable', icon: icons.default }];
    case '客服':
      return [{ name: '行事曆', path: '/calendar', icon: icons.calendar }, ...commonMenus];
    case '企劃':
      return [{ name: '行事曆', path: '/calendar', icon: icons.calendar }, { name: '建立專案', path: '/projects/create', icon: icons.default }, { name: '修改單', path: '/modifications/create', icon: icons.default }, ...commonMenus];
    case '視覺設計師':
    case '前端工程師':
    case '後端工程師':
      return [{ name: '行事曆', path: '/calendar', icon: icons.calendar }, { name: '我的專案', path: '/my-projects', icon: icons.default }, { name: '排程清單', path: '/schedules', icon: icons.default }, ...commonMenus];
    case '老闆':
    default:
      return [
        { name: '行事曆', path: '/calendar', icon: icons.calendar },
        { name: '系統設定', path: '/users', icon: icons.users },
        ...commonMenus
      ];
  }
})

// 控制手機版選單開關
const isMobileMenuOpen = ref(false)
const isDesktopMenuOpen = ref(true)

// 側邊欄展開狀態 (包含展開與滑鼠懸停)
const isSidebarHovered = ref(false)
const isSidebarExpanded = computed(() => isDesktopMenuOpen.value || isSidebarHovered.value || isMobileMenuOpen.value)

// 取得使用者資料 API
onMounted(async () => {
  try {
    // 模擬 API 呼叫讀取 public/api 底下的 JSON
    const res = await fetch(import.meta.env.BASE_URL + 'api/users.json')
    if (res.ok) {
      const data = await res.json()
      if (data && data.length > 0) {
        mockUsers.value = data
      }
    }
  } catch (error) {
    console.warn('無法載入 api/users.json，將使用預設靜態資料:', error)
  }
})
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden bg-gray-50">

    <!-- 桌機版/平板版 頂部 Header -->
    <header class="hidden md:flex h-16 bg-gray-900 text-white shrink-0 shadow-md z-20">
      <!-- 漢堡選單 (貼齊左側，與側邊欄相同底色) -->
      <button @click="isDesktopMenuOpen = !isDesktopMenuOpen" class="w-16 h-16 bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer shrink-0">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>
      <!-- Logo 區塊 -->
      <div class="flex items-center px-6 h-16">
        <h2 class="text-xl font-bold text-blue-400 tracking-wider">GRNET EIP</h2>
      </div>
    </header>

    <!-- 手機版 頂部 Header -->
    <div class="md:hidden flex items-center justify-between p-4 bg-gray-900 text-white shadow-md z-20 shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gray-800 text-blue-400 rounded flex items-center justify-center font-bold">G</div>
        <h2 class="text-xl font-bold text-blue-400 tracking-wider">GRNET EIP</h2>
      </div>
      <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="p-2 focus:outline-none bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors cursor-pointer">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>
    </div>

    <!-- 下方主體區塊 -->
    <div class="flex flex-1 overflow-hidden relative">
      <!-- 側邊欄 Navbar -->
      <nav
        @mouseenter="isSidebarHovered = true"
        @mouseleave="isSidebarHovered = false"
        :class="[
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          (isDesktopMenuOpen || isSidebarHovered) ? 'md:w-64' : 'md:w-16'
        ]"
        class="absolute md:relative inset-y-0 left-0 bg-gray-800 text-white flex flex-col transition-all duration-300 shadow-lg shrink-0 z-30 w-64 md:w-auto"
      >
        <!-- 登入者資訊與權限切換區塊 -->
        <div class="mb-4 transition-all duration-300" :class="isSidebarExpanded ? 'p-4 bg-gray-700 mx-4 mt-6 rounded-xl flex items-center space-x-3 shadow-inner' : 'p-3 mt-4 flex justify-center'">
          <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-lg font-bold shadow-md shrink-0 cursor-pointer" :title="(!isSidebarExpanded) ? currentUser.name : ''">
            {{ currentUser.name.charAt(0) }}
          </div>
          <div v-show="isSidebarExpanded" class="overflow-hidden flex-1 transition-opacity duration-300 whitespace-nowrap">
            <select v-model="selectedUserId" class="w-full bg-gray-600 text-white text-sm font-semibold rounded p-1 pl-2 border border-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer">
              <option v-for="user in mockUsers" :key="user.id" :value="user.id">
                {{ user.name }} ({{ user.role }})
              </option>
            </select>
            <div class="text-xs text-gray-400 truncate mt-1.5 px-1">{{ currentUser.department }}</div>
          </div>
        </div>

        <!-- 動態選單 -->
        <ul class="space-y-2 flex-1 px-3 overflow-y-auto overflow-x-hidden pt-2">
          <li v-for="item in menuItems" :key="item.path">
            <router-link
              :to="item.path"
              @click="isMobileMenuOpen = false"
              class="flex items-center rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors [&.router-link-active]:text-white [&.router-link-active]:bg-blue-600 [&.router-link-active]:font-semibold cursor-pointer whitespace-nowrap"
              :class="isSidebarExpanded ? 'px-4 py-3 space-x-3' : 'justify-center w-10 h-10 mx-auto mt-2'"
              :title="(!isSidebarExpanded) ? item.name : ''"
            >
              <!-- Icon 圖示 -->
              <div v-html="item.icon" class="flex-shrink-0 flex items-center justify-center"></div>
              <!-- 選單文字 -->
              <span v-show="isSidebarExpanded" class="truncate transition-opacity duration-300">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- 手機版半透明遮罩 -->
      <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="md:hidden fixed inset-0 bg-black/50 z-20"></div>

      <!-- 主要內容區 -->
      <main class="flex-1 p-4 md:p-8 overflow-y-auto w-full relative z-0">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>
