const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: "localhost", // 資料庫伺服器地址
    user: "root", // 資料庫用戶名
    password: "", // 資料庫密碼
    // database: database // 要操作的数据库名 庫名不一定要
    charset: "utf8mb4" // 確保使用 utf8mb4
});

connection.connect(err => {
    if (err) {
        console.error('連接資料庫失敗: ' + err.stack);
        return;
    }
    console.log('資料庫連接成功，連接 ID ' + connection.threadId);
});

// 創建主訂單 V
router.post('/master-order', (req, res) => {
    // 傳入參數 桌號
    // 判斷現在桌號有無人使用(是否有未結帳定訂單) 有就不開新訂單 否則開新訂單
    const { userId, items, tableNumber } = req.body;
    // 返回 建立失敗
    // 返回建立成功 訂單ID 訂單資訊
    res.json({
        success: true,
        orderId: "order123",
    });
});

// 修改主訂單
router.post('/modify-master-order', (req, res) => {
    // 傳入參數 桌號 修改內容(狀態 已結帳 已取消 未結帳{用餐中})
    // 
    const { userId, items, tableNumber } = req.body;
    // 返回修改成功或失敗 訂單ID
    res.json({
        success: true,
        orderId: "order123",
    });
});

// 提交子訂單 V
router.post('/sub-order/:master-order-id', (req, res) => {
    // 傳入參數 主訂單ID 菜品ID 數量 總金額
    // 確認主訂單是否未結帳 是則建立子訂單 否則不提交
    // 確認該菜品是否有庫存 是否存在 否則不提交
    // 返回成功或者失敗 子訂單ID
    const { userId, items, tableNumber } = req.body;
    // 新建子訂單
    // 新建子訂單及品項、數量、是否取消對照表
    res.json({
        success: true,
        orderId: "order123",
    });
});

// 修改子訂單
router.post('/modify-sub-order', (req, res) => {
    // 傳入參數 主訂單ID 子訂單ID 修改內容(狀態 已取消)
    const { userId, items, tableNumber } = req.body;
    // 返回修改成功或失敗 訂單ID
    res.json({
        success: true,
        orderId: "order123",
    });
});

// 獲取所有訂單
router.get('/orders', (req, res) => {
    // 返回所有主訂單資訊

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
        res.json({ success: false, message: "取得所有訂單" });
    }
});

// 獲取特定訂單的詳細資訊 V
router.get('/master-order', (req, res) => {
    const { orderId } = req.query;
    // 傳入 主訂單ID
    // 返回 完整訂單資料
    res.json({
        success: true,
        orderId: orderId,
        status: "取得訂單資料"
    });
});

// 獲取特定訂單的詳細資訊 V
router.get('/sub-order', (req, res) => {
    const { orderId } = req.query;
    // 傳入 主訂單ID
    // 返回 完整子訂單資料
    res.json({
        success: true,
        orderId: orderId,
        status: "取得訂單資料"
    });
});

<<<<<<< Updated upstream
//刪除食物
router.delete('/api/order/foods/:order_id/:food_id', async(req, res) => {
    const order_id = req.params['order_id']
    const food_id = req.params['food_id']

    try{
        var result = await dataRep.deleteOrderFood(order_id, food_id)
        console.log('delete result', result)
        return res.status(200).json(true);
    }catch(e){
        return res.status(400).json({
            error: e
        });
    }    
=======
// 結帳
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
    // 返回支付成功或失敗
    res.json({ success: true, message: "支付成功", receipt });
>>>>>>> Stashed changes
});

//進入點餐頁面      
router.post('/:order_id', async(req, res) => {
    let formData = req.body;
    const orderId = req.params['order_id']
    try{
        await dataRep.appendOrderFoods(orderId, formData)
        return res.status(200).send(true);
    }catch(e){
        return res.status(400).json({
            error: e
        });
    }
});

<<<<<<< Updated upstream
//取得訂單產品
router.get('/order/:order_id', async(req, res) => {
    const orderId = req.params['order_id']
    try{
        var foods = await dataRep.getOrderFoods(orderId)
        return res.status(200).json(foods);
    }catch(e){
        return res.status(400).json({
            error: e
        });
    }
});

=======
>>>>>>> Stashed changes
module.exports = router;

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

const master_order = [
    // 示例菜品數據
    {
        "masterOrderID": "1",
        "subOrders": [
            {
                "subOrderId": "1-1",
                "tatol": 1460
            },
            {
                "subOrderId": "1-2",
                "tatol": 4615
            },
        ],
    }
];

const sub_order = [
    // 示例菜品數據
    {
        "subOrderID": "1-1",
        "items": [
            {
                "name": "牛肉片",
                "quantity": 1,
            }
            ,
            {
                "name": "豬肉片",
                "quantity": 3,
            }
        ],
    }
];