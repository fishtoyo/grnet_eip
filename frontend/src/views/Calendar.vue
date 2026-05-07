<script setup>
import { ref, computed, reactive, onMounted } from 'vue'

// --- 行事曆邏輯 ---
const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]

// 模擬國定假日 (2026年範例，實務上未來可從 API 取得)
const holidays = ['2026-01-01', '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20', '2026-02-28', '2026-04-03', '2026-04-06', '2026-05-01', '2026-06-19', '2026-09-25', '2026-10-09', '2026-10-10']

// 計算包含上/下個月補齊天數的 42 格行事曆陣列
const calendarGrid = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const grid = []

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const pad = (n) => String(n).padStart(2, '0')

  // 取得真實的今天日期字串
  const realToday = new Date()
  const todayString = `${realToday.getFullYear()}-${pad(realToday.getMonth() + 1)}-${pad(realToday.getDate())}`

  const createDay = (dateObj, isCurrentMonth) => {
    const y = dateObj.getFullYear()
    const m = dateObj.getMonth() + 1
    const d = dateObj.getDate()
    const dateString = `${y}-${pad(m)}-${pad(d)}`
    const dayOfWeek = dateObj.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isHoliday = holidays.includes(dateString)
    const isToday = dateString === todayString

    return { date: d, dateString, isCurrentMonth, isOffDay: isWeekend || isHoliday, isToday }
  }

  // 補齊上個月
  for (let i = 0; i < firstDay; i++) {
    grid.push(createDay(new Date(year, month - 1, daysInPrevMonth - firstDay + i + 1), false))
  }
  // 當月
  for (let i = 1; i <= daysInMonth; i++) {
    grid.push(createDay(new Date(year, month, i), true))
  }
  // 補齊下個月 (補滿 42 格)
  const remainingCells = 42 - grid.length
  for (let i = 1; i <= remainingCells; i++) {
    grid.push(createDay(new Date(year, month + 1, i), false))
  }

  return grid
})

const prevMonth = () => { currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1) }
const nextMonth = () => { currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1) }
const goToToday = () => { currentDate.value = new Date() }

// 判斷是否為當前實際月份 (用以控制「回到今天」按鈕狀態)
const isCurrentMonthView = computed(() => {
  const today = new Date()
  return currentYear.value === today.getFullYear() && currentMonth.value === today.getMonth()
})

// 系統預設排程事件 (豐富假資料)
const defaultEvents = [
  { id: 1, date: "2026-05-05", title: "企劃部月會", time: "10:00", type: "meeting" },
  { id: 2, date: "2026-05-08", title: "客戶 A 需求訪談", time: "14:00", type: "client" },
  { id: 3, date: "2026-05-08", title: "設計規範同步會議", time: "16:30", type: "design" },
  { id: 4, date: "2026-05-10", title: "跨部門整合會議", time: "10:00", type: "meeting" },
  { id: 5, date: "2026-05-12", title: "系統架構檢討", time: "15:00", type: "engineering" },
  { id: 6, date: "2026-05-15", title: "專案 A 客戶驗收", time: "14:00", type: "client" },
  { id: 7, date: "2026-05-15", title: "UI 畫面設計定稿", time: "16:00", type: "design" },
  { id: 8, date: "2026-05-18", title: "前端切版檢閱", time: "13:30", type: "engineering" },
  { id: 9, date: "2026-05-20", title: "伺服器例行維護", time: "02:00", type: "engineering" },
  { id: 10, date: "2026-05-22", title: "工程部 Server 升級", time: "01:00", type: "engineering" },
  { id: 11, date: "2026-05-25", title: "產品上線發佈會", time: "10:00", type: "meeting" }
]

// 系統預設請假紀錄 (豐富假資料)
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

// 接收後端 API 排程事件
const calendarEvents = ref([])
// 接收後端請假資料
const allScheduledLeaves = ref([])

const fetchLeaves = async () => {
  const localData = localStorage.getItem('grnet_leave_requests')
  const parsedData = localData ? JSON.parse(localData) : []

  if (parsedData && parsedData.length > 0) {
    allScheduledLeaves.value = parsedData
  } else {
    try {
      const res = await fetch(import.meta.env.BASE_URL + 'api/leaveRequests.json')
      if (res.ok) {
        const data = await res.json()
        allScheduledLeaves.value = data.length ? data : defaultLeaves
      } else {
        allScheduledLeaves.value = defaultLeaves
      }
    } catch (error) {
      console.warn('無法載入 JSON，使用內建靜態請假資料')
      allScheduledLeaves.value = defaultLeaves
    }
    localStorage.setItem('grnet_leave_requests', JSON.stringify(allScheduledLeaves.value))
  }
}

onMounted(async () => {
  try {
    const res = await fetch(import.meta.env.BASE_URL + 'api/calendarEvents.json')
    if (res.ok) {
      const data = await res.json()
      calendarEvents.value = data.length ? data : defaultEvents
    } else {
      calendarEvents.value = defaultEvents
    }
  } catch (error) {
    console.warn('無法載入 JSON，使用內建靜態排程資料')
    calendarEvents.value = defaultEvents
  }
  fetchLeaves()
})

const getEventsForDate = (dateString) => {
  return calendarEvents.value.filter(e => e.date === dateString)
}
const getLeavesForDate = (dateString) => {
  return allScheduledLeaves.value.filter(leave => {
    return dateString >= leave.startDate && dateString <= leave.endDate
  })
}

// --- 彈窗與表單邏輯 ---
const isFormModalOpen = ref(false)
const activeTab = ref('event') // 'event' 或 'leave'

// 建立表單響應式資料 (結構相同，分開以便未來擴充)
const eventForm = reactive({ isAllDay: true, type: '', startDate: '', startTime: '09:00', endDate: '', endTime: '18:00', reason: '', path: '' })
const leaveForm = reactive({ isAllDay: true, type: '', startDate: '', startTime: '09:00', endDate: '', endTime: '18:00', reason: '' })

const openFormModal = (dateString) => {
  activeTab.value = 'event' // 預設顯示增添事項

  eventForm.isAllDay = true; eventForm.startDate = dateString; eventForm.endDate = dateString; eventForm.startTime = '09:00'; eventForm.endTime = '18:00'; eventForm.type = ''; eventForm.reason = ''; eventForm.path = ''
  leaveForm.isAllDay = true; leaveForm.startDate = dateString; leaveForm.endDate = dateString; leaveForm.startTime = '09:00'; leaveForm.endTime = '18:00'; leaveForm.type = ''; leaveForm.reason = ''

  isFormModalOpen.value = true
}
const closeFormModal = () => { isFormModalOpen.value = false }

const submitEventRequest = () => {
  if (eventForm.startDate > eventForm.endDate) return alert('錯誤：結束日期不能早於開始日期！')
  if (!eventForm.isAllDay && eventForm.startDate === eventForm.endDate && eventForm.startTime >= eventForm.endTime) return alert('錯誤：結束時間必須晚於開始時間！')

  alert('增添事項已成功送出！(前端模擬)')
  closeFormModal()
}

const submitLeaveRequest = () => {
  if (leaveForm.startDate > leaveForm.endDate) return alert('錯誤：結束日期不能早於開始日期！')
  if (!leaveForm.isAllDay && leaveForm.startDate === leaveForm.endDate && leaveForm.startTime >= leaveForm.endTime) return alert('錯誤：結束時間必須晚於開始時間！')

  const newRequest = { ...leaveForm }
  newRequest.id = Date.now()
  newRequest.status = 'pending'
  newRequest.statusName = '審核中'
  newRequest.name = '目前測試帳號'
  const typeMapping = { 'personal': '事假', 'sick': '病假', 'annual': '特別休假', 'official': '公假' }
  newRequest.typeName = typeMapping[newRequest.type] || newRequest.type

  const currentRequests = JSON.parse(localStorage.getItem('grnet_leave_requests')) || []
  currentRequests.push(newRequest)
  localStorage.setItem('grnet_leave_requests', JSON.stringify(currentRequests))

  alert('請假申請已成功送出！')
  closeFormModal()
  fetchLeaves() // 送出成功後更新畫面
}

// --- 檢視請假明細邏輯 ---
const isDetailModalOpen = ref(false)
const selectedLeaveDetail = ref(null)
const openLeaveDetails = (leave) => {
  selectedLeaveDetail.value = leave
  isDetailModalOpen.value = true
}
const closeDetailModal = () => {
  isDetailModalOpen.value = false
  selectedLeaveDetail.value = null
}

// --- 檢視排程明細邏輯 ---
const isEventDetailModalOpen = ref(false)
const selectedEventDetail = ref(null)
const openEventDetails = (event) => {
  selectedEventDetail.value = event
  isEventDetailModalOpen.value = true
}
const closeEventDetailModal = () => {
  isEventDetailModalOpen.value = false
  selectedEventDetail.value = null
}
</script>

<template>
  <div class="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-gray-100 min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-4rem)]">
    <!-- 頂部工具列 -->
    <div class="flex flex-wrap items-center gap-2 md:gap-4 min-h-[56px] md:min-h-[64px] mb-6 md:mb-8 border-b pb-4">
      <button @click="prevMonth" class="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <h1 class="text-xl md:text-2xl font-bold text-gray-800 w-32 md:w-40 text-center">
        {{ currentYear }}年 {{ monthNames[currentMonth] }}
      </h1>
      <button @click="nextMonth" class="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
      </button>
      <button @click="goToToday" :disabled="isCurrentMonthView" class="ml-0 md:ml-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
        回到今天
      </button>
    </div>

    <!-- 行事曆主體 -->
    <div class="border border-gray-200 rounded-lg overflow-hidden">
      <!-- 星期標題 -->
      <div class="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        <div v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" class="py-2 md:py-3 text-center text-xs md:text-sm font-semibold text-gray-600">
          {{ day }}
        </div>
      </div>

      <!-- 日期網格 -->
      <div class="grid grid-cols-7 bg-gray-200 gap-px">
        <div v-for="dayObj in calendarGrid" :key="dayObj.dateString" @click="openFormModal(dayObj.dateString)"
             class="min-h-[80px] md:min-h-[120px] p-1 md:p-2 hover:bg-blue-50 cursor-pointer transition-colors relative group flex flex-col"
             :class="[
               !dayObj.isCurrentMonth ? 'bg-gray-100' : (dayObj.isToday ? 'bg-green-50' : (dayObj.isOffDay ? 'bg-red-50' : 'bg-white'))
             ]">

          <div class="flex justify-end items-center mb-1 space-x-1">
            <button @click.stop="openFormModal(dayObj.dateString)" class="hidden md:block text-blue-600 bg-blue-100 hover:bg-blue-200 rounded text-[11px] px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-sm cursor-pointer" title="新增排程">
              + <span class="hidden lg:inline">新增</span>
            </button>
            <div class="text-sm font-medium flex items-center justify-center w-6 h-6 rounded-full transition-colors"
                 :class="dayObj.isToday ? 'bg-green-600 text-white shadow-sm' : (!dayObj.isCurrentMonth ? 'text-gray-400 group-hover:text-blue-600' : (dayObj.isOffDay ? 'text-red-500 group-hover:text-blue-600' : 'text-gray-600 group-hover:text-blue-600'))">
              {{ dayObj.date }}
            </div>
          </div>

          <!-- 顯示當天請假與排程事件名單 -->
          <div class="flex flex-col space-y-1 mt-0 md:mt-1">
            <!-- 顯示請假標籤 -->
            <div v-for="(leave, index) in getLeavesForDate(dayObj.dateString)" :key="'leave-'+index" @click.stop="openLeaveDetails(leave)" class="px-1 md:px-1.5 py-0.5 text-[10px] md:text-[11px] rounded-md truncate font-medium border mb-1 hover:shadow-sm hover:brightness-95 transition-all leading-tight cursor-pointer"
                 :class="leave.type === 'sick' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'"
                 :title="`${leave.name}(${leave.typeName}) ${leave.isAllDay ? '全天' : leave.startTime + '~' + leave.endTime}`">
              <span class="hidden md:inline">{{ leave.name }}({{ leave.typeName }}) {{ leave.isAllDay ? '全天' : leave.startTime + '~' + leave.endTime }}</span>
              <span class="md:hidden">{{ leave.name }}</span>
            </div>

            <!-- 顯示排程標籤 -->
            <div v-for="(event, index) in getEventsForDate(dayObj.dateString)" :key="index" @click.stop="openEventDetails(event)" class="px-1 md:px-1.5 py-0.5 text-[10px] md:text-[11px] rounded-md truncate font-medium border mb-1 hover:shadow-sm hover:brightness-95 transition-all leading-tight cursor-pointer"
                 :class="{
                   'bg-indigo-50 text-indigo-700 border-indigo-100': event.type === 'meeting',
                   'bg-purple-50 text-purple-700 border-purple-100': event.type === 'design',
                   'bg-orange-50 text-orange-700 border-orange-100': event.type === 'client',
                   'bg-teal-50 text-teal-700 border-teal-100': event.type === 'engineering',
                 }"
                 :title="`${event.time} ${event.title}`">
              <span class="hidden md:inline">{{ event.time }} {{ event.title }}</span>
              <span class="md:hidden">{{ event.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 填寫假單 / 增添事項 表單彈窗 Modal -->
    <div v-if="isFormModalOpen" @click.self="closeFormModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 cursor-pointer">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all cursor-default max-h-[90vh] flex flex-col">

        <!-- 頁籤 Header -->
        <div class="flex border-b border-gray-200 bg-gray-50 shrink-0 relative px-2">
          <button @click="activeTab = 'event'" :class="activeTab === 'event' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'" class="px-6 py-4 text-center border-b-2 font-bold text-sm transition-colors cursor-pointer">
            增添事項
          </button>
          <button @click="activeTab = 'leave'" :class="activeTab === 'leave' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'" class="px-6 py-4 text-center border-b-2 font-bold text-sm transition-colors cursor-pointer">
            填寫假單
          </button>
          <button @click="closeFormModal" class="absolute right-4 top-3 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer p-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- ================= 增添事項表單 ================= -->
        <form v-show="activeTab === 'event'" @submit.prevent="submitEventRequest" class="p-4 md:p-6 space-y-4 md:space-y-5 overflow-y-auto">
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">事項類型 <span class="text-red-500">*</span></label>
              <select v-model="eventForm.type" required class="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer appearance-none pr-10 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222%22%20stroke%3D%22%239ca3af%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19.5%208.25l-7.5%207.5-7.5-7.5%22%20/%3E%3C/svg%3E')] bg-[position:right_1rem_center] bg-[size:1.2em_1.2em] bg-no-repeat">
                <option value="" disabled>請選擇類型</option>
                <option value="meeting">內部會議</option>
                <option value="client">客戶會議</option>
                <option value="design">設計排程</option>
                <option value="engineering">工程排程</option>
              </select>
            </div>
            <div class="flex flex-col justify-end">
              <div class="flex items-center space-x-3 px-4 h-[42px] bg-gray-50 rounded-lg border border-gray-200 box-border">
                <label class="text-sm font-bold text-gray-700 select-none cursor-pointer" @click="eventForm.isAllDay = !eventForm.isAllDay">全天</label>
                <button type="button" @click="eventForm.isAllDay = !eventForm.isAllDay" :class="eventForm.isAllDay ? 'bg-blue-600' : 'bg-gray-300'" class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
                  <span :class="eventForm.isAllDay ? 'translate-x-5' : 'translate-x-0'" class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
            </div>
          </div>
          <div v-if="eventForm.isAllDay" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="block text-sm font-medium text-gray-700 mb-1">開始日期</label><input type="date" v-model="eventForm.startDate" required class="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">結束日期</label><input type="date" v-model="eventForm.endDate" required class="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"></div>
          </div>
          <div v-else class="space-y-4">
            <div><label class="block text-sm font-medium text-gray-700 mb-1">排程日期</label><input type="date" v-model="eventForm.startDate" required class="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label class="block text-sm font-medium text-gray-700 mb-1">開始時間</label><input type="time" v-model="eventForm.startTime" required class="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">結束時間</label><input type="time" v-model="eventForm.endTime" required class="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"></div>
            </div>
          </div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">路徑</label><input type="text" v-model="eventForm.path" required class="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">事項標題</label><textarea v-model="eventForm.reason" rows="3" required class="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none transition-colors"></textarea></div>
          <div class="flex justify-end pt-2 space-x-3">
            <button type="button" @click="closeFormModal" class="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors shadow-sm cursor-pointer">取消</button>
            <button type="submit" class="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">新增事項</button>
          </div>
        </form>

        <!-- ================= 填寫假單表單 ================= -->
        <form v-show="activeTab === 'leave'" @submit.prevent="submitLeaveRequest" class="p-4 md:p-6 space-y-4 md:space-y-5 overflow-y-auto">
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">假別 <span class="text-red-500">*</span></label>
              <select v-model="leaveForm.type" required class="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer appearance-none pr-10 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222%22%20stroke%3D%22%239ca3af%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19.5%208.25l-7.5%207.5-7.5-7.5%22%20/%3E%3C/svg%3E')] bg-[position:right_1rem_center] bg-[size:1.2em_1.2em] bg-no-repeat">
                <option value="" disabled>請選擇假別</option>
                <option value="personal">事假</option>
                <option value="sick">病假</option>
                <option value="annual">特別休假</option>
                <option value="official">公假</option>
              </select>
            </div>
            <div class="flex flex-col justify-end">
              <div class="flex items-center space-x-3 px-4 h-[42px] bg-gray-50 rounded-lg border border-gray-200 box-border">
                <label class="text-sm font-bold text-gray-700 select-none cursor-pointer" @click="leaveForm.isAllDay = !leaveForm.isAllDay">全天</label>
                <button type="button" @click="leaveForm.isAllDay = !leaveForm.isAllDay" :class="leaveForm.isAllDay ? 'bg-blue-600' : 'bg-gray-300'" class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
                  <span :class="leaveForm.isAllDay ? 'translate-x-5' : 'translate-x-0'" class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
            </div>
          </div>
          <div v-if="leaveForm.isAllDay" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="block text-sm font-medium text-gray-700 mb-1">開始日期</label><input type="date" v-model="leaveForm.startDate" required class="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">結束日期</label><input type="date" v-model="leaveForm.endDate" required class="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"></div>
          </div>
          <div v-else class="space-y-4">
            <div><label class="block text-sm font-medium text-gray-700 mb-1">請假日期</label><input type="date" v-model="leaveForm.startDate" required class="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label class="block text-sm font-medium text-gray-700 mb-1">開始時間</label><input type="time" v-model="leaveForm.startTime" required class="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">結束時間</label><input type="time" v-model="leaveForm.endTime" required class="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"></div>
            </div>
          </div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">請假事由</label><textarea v-model="leaveForm.reason" rows="3" required class="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none transition-colors"></textarea></div>
          <div class="flex justify-end pt-2 space-x-3">
            <button type="button" @click="closeFormModal" class="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors shadow-sm cursor-pointer">取消</button>
            <button type="submit" class="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">送出申請</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 檢視請假明細彈窗 Modal -->
    <div v-if="isDetailModalOpen" @click.self="closeDetailModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 cursor-pointer">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all cursor-default">
        <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-800">請假明細</h3>
          <button @click="closeDetailModal" class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-3 gap-y-3 text-sm border-b pb-4">
            <div class="text-gray-500">請假人</div><div class="col-span-2 font-medium text-gray-800">{{ selectedLeaveDetail?.name }}</div>
            <div class="text-gray-500">假別</div><div class="col-span-2 font-medium text-gray-800">{{ selectedLeaveDetail?.typeName || selectedLeaveDetail?.type }}</div>
            <div class="text-gray-500">狀態</div><div class="col-span-2">
              <span :class="selectedLeaveDetail?.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'" class="px-2.5 py-1 rounded-full text-xs font-semibold">
                {{ selectedLeaveDetail?.status === 'approved' ? '已核准' : '審核中' }}
              </span>
            </div>
            <div class="text-gray-500">日期</div><div class="col-span-2 font-medium text-gray-800">{{ selectedLeaveDetail?.date || selectedLeaveDetail?.startDate }}</div>
            <div class="text-gray-500">時間</div><div class="col-span-2 font-medium text-gray-800">{{ selectedLeaveDetail?.isAllDay ? '全天' : `${selectedLeaveDetail?.startTime} ~ ${selectedLeaveDetail?.endTime}` }}</div>
          </div>
          <div>
            <div class="text-gray-500 text-sm mb-2">請假事由</div>
            <div class="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[80px] text-sm leading-relaxed">
              {{ selectedLeaveDetail?.reason || '無' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 檢視排程明細彈窗 Modal -->
    <div v-if="isEventDetailModalOpen" @click.self="closeEventDetailModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 cursor-pointer">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all cursor-default">
        <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-800">排程明細</h3>
          <button @click="closeEventDetailModal" class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-3 gap-y-3 text-sm border-b pb-4">
            <div class="text-gray-500">事項類型</div>
            <div class="col-span-2 font-medium text-gray-800">
              <span v-if="selectedEventDetail?.type === 'meeting'">內部會議</span>
              <span v-else-if="selectedEventDetail?.type === 'client'">客戶會議</span>
              <span v-else-if="selectedEventDetail?.type === 'design'">設計排程</span>
              <span v-else-if="selectedEventDetail?.type === 'engineering'">工程排程</span>
              <span v-else>{{ selectedEventDetail?.type }}</span>
            </div>
            <div class="text-gray-500">日期</div><div class="col-span-2 font-medium text-gray-800">{{ selectedEventDetail?.date }}</div>
            <div class="text-gray-500">時間</div><div class="col-span-2 font-medium text-gray-800">{{ selectedEventDetail?.time }}</div>
          </div>
          <div v-if="selectedEventDetail?.path">
            <div class="text-gray-500 text-sm mb-2">路徑</div>
            <div class="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm leading-relaxed truncate" :title="selectedEventDetail.path">
              {{ selectedEventDetail.path }}
            </div>
          </div>
          <div>
            <div class="text-gray-500 text-sm mb-2">事項標題</div>
            <div class="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[80px] text-sm leading-relaxed">
              {{ selectedEventDetail?.title || '無' }}
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
