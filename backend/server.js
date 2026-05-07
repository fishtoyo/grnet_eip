const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// 啟用 CORS 允許前端發送跨域請求
app.use(cors());
// 解析 JSON 格式的請求本體
app.use(express.json());

// 輔助函式：讀取 JSON 假資料
const readData = (filename) => {
  const filePath = path.join(__dirname, 'data', filename);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`讀取 ${filename} 發生錯誤:`, error);
    return [];
  }
};

// 輔助函式：寫入 JSON 假資料
const writeData = (filename, data) => {
  const filePath = path.join(__dirname, 'data', filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// --- API 路由 ---

// 測試 API 是否正常運行
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to grnet_eip Backend API' });
});

// 取得所有使用者列表 (測試假資料庫讀取)
app.get('/api/users', (req, res) => {
  const users = readData('users.json');
  res.json(users);
});

// 取得所有請假單
app.get('/api/leave-requests', (req, res) => {
  const requests = readData('leaveRequests.json');
  res.json(requests);
});

// 取得行事曆排程事件
app.get('/api/calendar-events', (req, res) => {
  const events = readData('calendarEvents.json');
  res.json(events);
});

// 新增請假單 API
app.post('/api/leave-requests', (req, res) => {
  try {
    const newRequest = req.body;
    const requests = readData('leaveRequests.json');
    
    // 為新假單產生唯一的 ID (這裡使用當下時間戳)
    newRequest.id = Date.now();
    // 強制設定初始狀態為審核中
    newRequest.status = 'pending';
    newRequest.statusName = '審核中';
    // 補上名稱 (前端尚未有狀態管理，暫時寫死以利測試)
    newRequest.name = '目前測試帳號';
    // 轉換中文假別名稱
    const typeMapping = { 'personal': '事假', 'sick': '病假', 'annual': '特別休假', 'official': '公假' };
    newRequest.typeName = typeMapping[newRequest.type] || newRequest.type;
    
    requests.push(newRequest);
    writeData('leaveRequests.json', requests);
    
    res.status(201).json({ message: '請假申請已成功送出', data: newRequest });
  } catch (error) {
    res.status(500).json({ message: '伺服器錯誤，無法儲存請假單' });
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});