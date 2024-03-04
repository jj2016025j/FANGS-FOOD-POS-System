const express = require('express');
const kitchenRouter = require('./script/router/kitchenRouter'); // 確保路徑正確
const orderRouter = require('./script/router/orderRouter'); // 確保路徑正確
const dataRouter = require('./script/router/dataRouter'); // 確保路徑正確
const webRouter = require('./script/router/webRouter'); // 確保路徑正確
const app = express();
const port = 3000;

app.use(express.json());
app.use('/kitchen', kitchenRouter);
app.use('/order', orderRouter);
app.use('/data', dataRouter);
app.use('/web', webRouter);

//導航到home
app.get('/', (req, res) => {
    res.redirect('/web');
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

const login = function(req, res, next){
    // 取得用戶目前角色
    const role = req.body.role;
    // 從MYSQL取得該路徑所需權限
    const requiredRole = 'admin'; // 設定權限為admin
    // 檢查角色是否符合權限
    if (role === requiredRole) {
        next();
    } else {
        // 跳轉道登入畫面
        res.status(401).send('Unauthorized');
    }
}

////////////////////////////////////////////////////
// 限流
// npm install express-rate-limit
const rateLimit = require('express-rate-limit');

// 應用於所有請求的基本限流設定
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分鐘
    max: 100, // 限制每個IP在15分鐘內最多100個請求
});

app.use(limiter); // 應用限流中間件
////////////////////////////////////////////////////

////////////////////////////////////////////////////
// JWT驗證
// npm install jsonwebtoken
const jwt = require('jsonwebtoken');

const secretKey = 'your_secret_key'; // 保持安全，可以使用環境變量來存儲

// JWT驗證中間件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // 如果沒有token，返回401

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403); // 如果token不有效，返回403
        req.user = user;
        next();
    });
};
////////////////////////////////////////////////////


app.use(login);