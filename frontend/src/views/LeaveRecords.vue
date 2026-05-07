<script setup>
import { ref, computed, onMounted } from 'vue'

// 接收後端請假紀錄 (API)
const leaveRecords = ref([])

const defaultLeaves = [
  { id: 1, name: "設計 E", type: "annual", typeName: "特別休假", isAllDay: true, startDate: "2026-05-01", endDate: "2026-05-02", startTime: "09:00", endTime: "18:00", status: "approved", statusName: "已核准", reason: "家庭旅遊" },
  { id: 2, name: "客服 D", type: "personal", typeName: "事假", isAllDay: false, startDate: "2026-05-05", endDate: "2026-05-05", startTime: "09:00", endTime: "12:00", status: "approved", statusName: "已核准", reason: "處理私事" },
  { id: 3, name: "老闆 A", type: "personal", typeName: "事假", isAllDay: false, startDate: "2026-05-08", endDate: "2026-05-08", startTime: "14:00", endTime: "16:00", status: "approved", statusName: "已核准", reason: "辦理銀行私人事務" },
  { id: 4, name: "設計 E", type: "personal", typeName: "事假", isAllDay: false, startDate: "2026-05-08", endDate: "2026-05-08", startTime: "10:00", endTime: "12:00", status: "pending", statusName: "審核中", reason: "外出辦事" },
  { id: 5, name: "會計 B", type: "annual", typeName: "特別休假", isAllDay: true, startDate: "2026-05-12", endDate: "2026-05-12", startTime: "09:00", endTime: "18:00", status: "approved", statusName: "已核准", reason: "個人休假" },
  { id: 6, name: "企劃 C", type: "sick", typeName: "病假", isAllDay: true, startDate: "2026-05-15", endDate: "2026-05-15", startTime: "09:00", endTime: "18:00", status: "approved", statusName: "已核准", reason: "感冒發燒，至診所就醫休養" },
  { id: 7, name: "前端 F", type: "sick", typeName: "病假", isAllDay: true, startDate: "2026-05-18", endDate: "2026-05-18", startTime: "09:00", endTime: "18:00", status: "approved", statusName: "已核准", reason: "身體不適，請假休息" },
  { id: 8, name: "老闆 A", type: "personal", typeName: "事假", isAllDay: false, startDate: "2026-05-20", endDate: "2026-05-20", startTime: "09:30", endTime: "10:30", status: "pending", statusName: "審核中", reason: "需至戶政事務所辦理私人事務" },
  { id: 9, name: "後端 G", type: "official", typeName: "公假", isAllDay: true, startDate: "2026-05-22", endDate: "2026-05-22", startTime: "09:00", endTime: "18:00", status: "approved", statusName: "已核准", reason: "參加外部教育訓練課程" },
  { id: 10, name: "企劃 C", type: "annual", typeName: "特別休假", isAllDay: true, startDate: "2026-05-27", endDate: "2026-05-28", startTime: "09:00", endTime: "18:00", status: "pending", statusName: "審核中", reason: "個人休假安排" }
]

onMounted(async () => {
  const localData = localStorage.getItem('grnet_leave_requests')
  const parsedData = localData ? JSON.parse(localData) : []

  if (parsedData && parsedData.length > 0) {
    leaveRecords.value = parsedData
  } else {
    try {
      const res = await fetch(import.meta.env.BASE_URL + 'api/leaveRequests.json')
      if (res.ok) {
        const data = await res.json()
        leaveRecords.value = data.length ? data : defaultLeaves
      } else {
        leaveRecords.value = defaultLeaves
      }
    } catch (error) {
      console.warn('無法載入 JSON，使用內建靜態請假資料')
      leaveRecords.value = defaultLeaves
    }
    localStorage.setItem('grnet_leave_requests', JSON.stringify(leaveRecords.value))
  }
})

// 將紀錄依據「年月」分組，並依照日期由新到舊排序
const groupedRecords = computed(() => {
  const groups = {}
  // 排序：新的日期排在前面
  const sortedRecords = [...leaveRecords.value].sort((a, b) => new Date(b.startDate) - new Date(a.startDate))

  sortedRecords.forEach(record => {
    const date = new Date(record.startDate)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const key = `${year}年 ${month}月`

    if (!groups[key]) groups[key] = []
    groups[key].push(record)
  })
  return groups
})

// 畫面顯示邏輯
const displayDate = (record) => {
  if (record.isAllDay) {
    return record.startDate === record.endDate ? record.startDate : `${record.startDate} ~ ${record.endDate}`
  }
  return record.startDate // 非全天一定只有單日
}
const displayTime = (record) => {
  if (record.isAllDay) return '全天'
  return `${record.startTime} ~ ${record.endTime}`
}
</script>

<template>
  <div class="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-gray-100 min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)]">
    <div class="flex items-center min-h-[56px] md:min-h-[64px] mb-6 md:mb-8 border-b pb-4">
      <h2 class="text-xl md:text-2xl font-bold text-gray-800">我的請假紀錄</h2>
    </div>

    <!-- 空狀態顯示 -->
    <div v-if="Object.keys(groupedRecords).length === 0" class="text-center text-gray-500 py-10">
      目前沒有任何請假紀錄
    </div>

    <!-- 依年月分組顯示 -->
    <div v-else class="space-y-10">
      <div v-for="(records, monthKey) in groupedRecords" :key="monthKey">
        <!-- 分類標題：年月與次數 -->
        <div class="flex items-center space-x-3 mb-4">
          <h3 class="text-xl font-bold text-gray-700">{{ monthKey }}</h3>
          <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">共 {{ records.length }} 次</span>
        </div>

        <!-- 該月份的請假列表 -->
        <div class="flex flex-col border-t border-gray-100">
          <div v-for="record in records" :key="record.id" class="flex flex-col py-4 md:py-5 px-2 md:px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <!-- 左上假別 / 右上狀態 -->
            <div class="flex justify-between items-center mb-3">
              <span class="font-bold text-gray-800 text-lg">{{ record.typeName }}</span>
              <span :class="record.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'" class="px-3 py-1 rounded-full text-sm font-semibold">{{ record.statusName }}</span>
            </div>

            <!-- 資料內容：整筆包在一起 -->
            <div class="text-sm text-gray-700 space-y-2">
              <div class="flex"><span class="text-gray-400 w-10 md:w-12 shrink-0">日期：</span><span class="font-medium">{{ displayDate(record) }}</span></div>
              <div class="flex"><span class="text-gray-400 w-10 md:w-12 shrink-0">時間：</span><span class="font-medium">{{ displayTime(record) }}</span></div>
              <div class="flex"><span class="text-gray-400 w-10 md:w-12 shrink-0">事由：</span><span class="leading-relaxed">{{ record.reason || '無填寫事由' }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
