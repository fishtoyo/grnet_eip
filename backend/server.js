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

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});