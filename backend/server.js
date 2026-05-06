const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// 測試 API：檢查伺服器是否正常運作
app.get('/api/health', (req, res) => {
    res.json({ status: 'success', message: 'EIP 後端伺服器運作中！' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});