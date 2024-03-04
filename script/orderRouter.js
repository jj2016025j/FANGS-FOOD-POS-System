const express = require('express');
const router = express.Router();

// Middleware
router.use(bodyParser.json());

// 假設 orders 和 dishes 是從某處獲得的數據，這裡為了簡化直接定義了
// 實際應用中，這些數據應該從數據庫或其他數據源動態獲取
const orders = {};
const dishes = [
    // 示例菜品數據
    {
        "dishId": "1",
        "name": "牛肉片",
        "description": "新鮮牛肉，適合涮火鍋",
        "price": 50,
        "category": "肉類",
        "image": "url_to_image",
        "rating": 4.5
    }
];

// 確認訂單信息API
router.get('/order-info', (req, res) => {
    const { orderId } = req.query;
    const order = orders[orderId];
    if (order) {
        const orderInfo = {
            orderId: orderId,
            items: order.items.map(item => {
                const dish = dishes.find(d => d.dishId === item.dishId);
                return {
                    ...item,
                    name: dish ? dish.name : "未知菜品",
                    price: dish ? dish.price : 0,
                    totalPrice: dish ? dish.price * item.quantity : 0
                };
            }),
            totalQuantity: order.items.reduce((acc, item) => acc + item.quantity, 0),
            totalPrice: order.items.reduce((acc, item) => {
                const dish = dishes.find(d => d.dishId === item.dishId);
                return acc + (dish ? dish.price * item.quantity : 0);
            }, 0)
        };
        res.json({ success: true, orderInfo });
    } else {
        res.json({ success: false, message: "訂單不存在" });
    }
});

// 提交支付API
router.post('/pay', (req, res) => {
    const { orderId, paymentMethod, amount } = req.body;
    const receiptId = `receipt${Object.keys(orders).length + 1}`;
    const receipt = {
        receiptId,
        amount,
        paymentMethod,
        status: "已支付"
    };
    orders[orderId].receipt = receipt;
    res.json({ success: true, message: "支付成功", receipt });
});

// 發票開具API
router.post('/invoice', (req, res) => {
    const { orderId, receiptId, invoiceType, carrier } = req.body;
    const invoiceId = `invoice${Object.keys(orders).length + 1}`;
    const invoice = {
        invoiceId,
        orderId,
        receiptId,
        invoiceType,
        carrier,
        status: "已開具"
    };
    if (orders[orderId]) orders[orderId].invoice = invoice;
    res.json({ success: true, message: "發票已開具", invoice });
});

// 獲取菜單列表 API
router.get('/menu', (req, res) => {
    const { category } = req.query;
    // 這裡應該有一段邏輯來從資料庫獲取菜單列表，並按類型過濾（如果有指定category）
    res.json({
        success: true,
        data: [
            // 返回菜單數據
        ]
    });
});

// 添加菜品到購物車 API
router.post('/cart/add', (req, res) => {
    const { userId, dishId, quantity } = req.body;
    // 這裡應該有一段邏輯來處理添加菜品到購物車的請求
    res.json({
        success: true,
        message: "菜品成功添加到購物車"
    });
});

// 獲取購物車內容 API
router.get('/cart', (req, res) => {
    const { userId } = req.query;
    // 這裡應該有一段邏輯來從資料庫獲取指定用戶的購物車內容
    res.json({
        success: true,
        data: {
            items: [
                // 返回購物車內容
            ],
            totalQuantity: 0,
            totalPrice: 0
        }
    });
});

// 提交訂單 API
router.post('/orders/submit', (req, res) => {
    const { userId, items, tableNumber } = req.body;
    // 這裡應該有一段邏輯來處理訂單提交，包括轉址給第三方認證等
    res.json({
        success: true,
        orderId: "order123",
        message: "訂單提交成功"
    });
});

// 查詢訂單狀態 API
router.get('/orders/status', (req, res) => {
    const { orderId } = req.query;
    // 這裡應該有一段邏輯來從資料庫獲取訂單狀態
    res.json({
        success: true,
        orderId: orderId,
        status: "正在準備"
    });
});

module.exports = router;