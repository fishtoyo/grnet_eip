<script setup>
import { ref } from 'vue'

// 模擬目前登入的使用者 (假資料)
// 未來這裡的資料會從登入 API 或全域狀態 (如 Pinia, Vuex) 取得
const currentUser = ref({
  name: '老闆 A',
  role: 'Admin',
  department: 'Management'
})

// 控制手機版選單開關
const isMobileMenuOpen = ref(false)
</script>

<template>
  <div class="flex flex-col md:flex-row min-h-screen bg-gray-50">
    <!-- 手機版頂部導覽列 -->
    <div class="md:hidden flex items-center justify-between p-4 bg-gray-800 text-white shadow-md z-20 relative">
      <h2 class="text-xl font-bold text-blue-400 tracking-wider">GRNET EIP</h2>
      <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="p-2 focus:outline-none hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>
    </div>

    <!-- 側邊欄 -->
    <nav :class="isMobileMenuOpen ? 'flex' : 'hidden md:flex'" class="w-full md:w-64 bg-gray-800 text-white p-6 flex-col shadow-lg z-10 transition-all duration-300">
      <h2 class="hidden md:block text-2xl font-bold mb-8 text-blue-400 tracking-wider text-center">GRNET EIP</h2>

      <!-- 登入者資訊區塊 -->
      <div class="mb-6 md:mb-8 p-4 bg-gray-700 rounded-xl flex items-center space-x-3 shadow-inner">
        <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-lg font-bold shadow-md">
          {{ currentUser.name.charAt(0) }}
        </div>
        <div class="overflow-hidden">
          <div class="text-sm font-semibold truncate">{{ currentUser.name }}</div>
          <div class="text-xs text-gray-400 truncate">{{ currentUser.department }} - {{ currentUser.role }}</div>
        </div>
      </div>

      <ul class="space-y-2 flex-1">
        <li>
          <router-link
            to="/users"
            @click="isMobileMenuOpen = false"
            class="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors [&.router-link-active]:text-white [&.router-link-active]:bg-blue-600 [&.router-link-active]:font-semibold cursor-pointer"
          >
            使用者列表 (測試)
          </router-link>
        </li>
        <li>
          <router-link
            to="/leave"
            @click="isMobileMenuOpen = false"
            class="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors [&.router-link-active]:text-white [&.router-link-active]:bg-blue-600 [&.router-link-active]:font-semibold cursor-pointer"
          >
            差勤請假系統
          </router-link>
        </li>
        <li>
          <router-link
            to="/leave-records"
            @click="isMobileMenuOpen = false"
            class="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors [&.router-link-active]:text-white [&.router-link-active]:bg-blue-600 [&.router-link-active]:font-semibold cursor-pointer"
          >
            我的請假紀錄
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- 主要內容區 -->
    <main class="flex-1 p-4 md:p-8 overflow-y-auto w-full">
      <router-view></router-view>
    </main>
  </div>
</template>
