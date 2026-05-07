<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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

// 接收後端排定的請假資料 (API)
const allScheduledLeaves = ref([])

const fetchLeaves = async () => {
  const localData = localStorage.getItem('grnet_leave_requests')
  if (localData) {
    allScheduledLeaves.value = JSON.parse(localData)
  } else {
    try {
      const res = await fetch(import.meta.env.BASE_URL + 'api/leaveRequests.json')
      const data = await res.json()
      allScheduledLeaves.value = data
      localStorage.setItem('grnet_leave_requests', JSON.stringify(data))
    } catch (error) {
      console.error('無法載入預設請假紀錄', error)
    }
  }
}

onMounted(() => fetchLeaves())

// 取得某一天對應的請假紀錄
const getLeavesForDate = (dateString) => {
  // 改為支援「多天跨區間」比對邏輯：只要該日期落在請假的 startDate 與 endDate 之間，就會顯示！
  return allScheduledLeaves.value.filter(leave => {
    return dateString >= leave.startDate && dateString <= leave.endDate
  })
}

// --- 填寫假單表單邏輯 ---
const isFormModalOpen = ref(false)

// 建立表單響應式資料
const leaveForm = reactive({
  isAllDay: true,
  type: '',
  startDate: '',
  startTime: '09:00',
  endDate: '',
  endTime: '18:00',
  reason: ''
})

// 打開表單並帶入選取的日期
const openFormModal = (dateString) => {
  leaveForm.isAllDay = true
  leaveForm.startDate = dateString
  leaveForm.endDate = dateString
  leaveForm.startTime = '09:00'
  leaveForm.endTime = '18:00'
  leaveForm.type = ''
  leaveForm.reason = ''

  isFormModalOpen.value = true
}

const closeFormModal = () => {
  isFormModalOpen.value = false
}

// 處理表單送出
const submitLeaveRequest = async () => {
  // 表單防呆驗證：結束時間/日期不能早於開始時間/日期
  if (leaveForm.startDate > leaveForm.endDate) {
    return alert('錯誤：結束日期不能早於開始日期！')
  }
  if (!leaveForm.isAllDay && leaveForm.startDate === leaveForm.endDate && leaveForm.startTime >= leaveForm.endTime) {
    return alert('錯誤：結束時間必須晚於開始時間！')
  }

  // 模擬後端 POST 行為，寫入 localStorage
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
  fetchLeaves() // 送出成功後，重新抓取資料讓行事曆立即更新畫面！
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
      <button @click="goToToday" :disabled="isCurrentMonthView" class="ml-0 md:ml-2 px-4 py-2 text-sm bg-gray-800 text-gray-100 font-medium rounded-lg hover:bg-gray-500 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
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
            <!-- 懸浮提示新增按鈕 (縮小至右上角) -->
            <button @click.stop="openFormModal(dayObj.dateString)" class="hidden md:block text-blue-600 bg-blue-100 hover:bg-blue-200 rounded text-[11px] px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-sm cursor-pointer" title="填寫假單">
              + <span class="hidden lg:inline">新增</span>
            </button>
            <div class="text-sm font-medium flex items-center justify-center w-6 h-6 rounded-full transition-colors"
                 :class="dayObj.isToday ? 'bg-green-600 text-white shadow-sm' : (!dayObj.isCurrentMonth ? 'text-gray-400 group-hover:text-blue-600' : (dayObj.isOffDay ? 'text-red-500 group-hover:text-blue-600' : 'text-gray-600 group-hover:text-blue-600'))">
              {{ dayObj.date }}
            </div>
          </div>

          <!-- 顯示當天請假者名單 -->
          <div class="flex flex-col space-y-1 mt-0 md:mt-1">
            <div v-for="(leave, index) in getLeavesForDate(dayObj.dateString)" :key="index" @click.stop="openLeaveDetails(leave)" class="px-1 md:px-1.5 py-0.5 text-[10px] md:text-[11px] rounded-md truncate font-medium border mb-1 hover:shadow-sm hover:brightness-95 transition-all leading-tight"
                 :class="leave.type === '病假' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'"
                 :title="`${leave.name}(${leave.type}) ${leave.isAllDay ? '全天' : leave.startTime + '~' + leave.endTime}`">
              <span class="hidden md:inline">{{ leave.name }}({{ leave.type }}) {{ leave.isAllDay ? '全天' : leave.startTime + '~' + leave.endTime }}</span>
              <span class="md:hidden">{{ leave.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 填寫假單表單彈窗 Modal -->
    <div v-if="isFormModalOpen" @click.self="closeFormModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 cursor-pointer">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all cursor-default max-h-[90vh] flex flex-col">
        <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-800">填寫請假單</h3>
          <button @click="closeFormModal" class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form @submit.prevent="submitLeaveRequest" class="p-4 md:p-6 space-y-4 md:space-y-5 overflow-y-auto">
          <!-- 假別與全天請假並排 -->
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
                <button type="button" @click="leaveForm.isAllDay = !leaveForm.isAllDay"
                        :class="leaveForm.isAllDay ? 'bg-blue-600' : 'bg-gray-300'"
                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
                  <span :class="leaveForm.isAllDay ? 'translate-x-5' : 'translate-x-0'" class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
            </div>
          </div>

          <!-- 根據全天狀態切換輸入區塊 -->
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
            <div class="text-gray-500">假別</div><div class="col-span-2 font-medium text-gray-800">{{ selectedLeaveDetail?.type }}</div>
            <div class="text-gray-500">狀態</div><div class="col-span-2">
              <span :class="selectedLeaveDetail?.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'" class="px-2.5 py-1 rounded-full text-xs font-semibold">
                {{ selectedLeaveDetail?.status === 'approved' ? '已核准' : '審核中' }}
              </span>
            </div>
            <div class="text-gray-500">日期</div><div class="col-span-2 font-medium text-gray-800">{{ selectedLeaveDetail?.date }}</div>
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

  </div>
</template>
