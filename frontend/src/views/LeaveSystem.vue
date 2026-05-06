<script setup>
import { ref } from 'vue'
import leaveRequestsData from '../mock/leaveRequests.json'

const leaveRequests = ref(leaveRequestsData)
</script>

<template>
  <div class="max-w-full mx-auto bg-white rounded-lg shadow-md p-6">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">差勤請假系統</h1>
    
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b">
            <th class="p-3 font-medium text-gray-600">申請人</th>
            <th class="p-3 font-medium text-gray-600">部門</th>
            <th class="p-3 font-medium text-gray-600">假別</th>
            <th class="p-3 font-medium text-gray-600">開始日期</th>
            <th class="p-3 font-medium text-gray-600">結束日期</th>
            <th class="p-3 font-medium text-gray-600">狀態</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="req in leaveRequests" :key="req.id" class="border-b hover:bg-gray-50">
            <td class="p-3">{{ req.applicant }}</td>
            <td class="p-3">{{ req.department }}</td>
            <td class="p-3">{{ req.type }}</td>
            <td class="p-3">{{ req.startDate }}</td>
            <td class="p-3">{{ req.endDate }}</td>
            <td class="p-3">
              <span class="px-2 py-1 text-sm rounded-full" :class="req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                {{ req.status === 'approved' ? '已核准' : '簽核中' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>