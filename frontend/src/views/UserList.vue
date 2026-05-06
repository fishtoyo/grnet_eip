<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const users = ref([])
const loading = ref(true)
const error = ref(null)

const fetchUsers = async () => {
  try {
    // 呼叫後端 API
    const response = await axios.get('http://localhost:3000/api/users')
    users.value = response.data
  } catch (err) {
    error.value = '無法載入使用者資料，請確認後端伺服器 (port 3000) 是否已啟動。'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-gray-100 min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)]">
    <div class="flex items-center min-h-[56px] md:min-h-[64px] mb-6 md:mb-8 border-b pb-4">
      <h1 class="text-xl md:text-2xl font-bold text-gray-800">使用者列表 (API 測試)</h1>
    </div>

    <div v-if="loading" class="text-gray-500">資料載入中...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <!-- 列表改為橫向排列 (Row) -->
    <div v-else class="flex flex-col border-t border-gray-100">
      <div v-for="user in users" :key="user.id" class="flex flex-col md:flex-row md:items-center py-4 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <span class="font-bold text-gray-800 w-32">{{ user.name }}</span>
        <span class="text-gray-600 text-sm">{{ user.department }} - {{ user.role }}</span>
      </div>
    </div>
  </div>
</template>
