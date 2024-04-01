const express = require('express');
const router = express.Router();
const dbOperations = require('../../pos_mysql'); 

const { printOrder, printOrderWithQR } = require('../printer');
const { TimeFormat } = require('../timeFormatted.js')

const getIp = require("../getIPAddress.js")
const LocalIP = getIp.getLocalIPAddress()

//新增訂單
// http://localhost:3000/order
router.post('/', async (req, res) => {
    const tableNum = req.body.seatID;
    const OrderId = dbOperations.generateMainOrderId()
// 
    try {
        var result = await dbOperations.addTableOrder(tableNum)
        // console.log(result.insertId)
        var orders = await dbOperations.getPendingTableOrders();
        const obj = await dbOperations.getTradeNoById(result.insertId)
        const trade_no = obj.trade_no
        const order_id = result.insertId
        const protocol = req.protocol; // 'http' 或 'https'
        const host = req.get('host'); // 'localhost:3000', 'example.com' 等
        const url = req.originalUrl; // 请求的路径和查询字符串 '/some-path?query=value'
        // const fullUrl = `${protocol}://${host}${url}/${trade_no}`;
        const fullUrl = `${protocol}://${LocalIP}:3000/pos/phone/${trade_no}`;
        // console.log(fullUrl);
        try {
            printOrderWithQR(fullUrl, order_id, tableNum)
        } catch (e) {
            // console.log(e)
        }
        return res.status(200).json(orders);
    } catch (e) {
        // console.log(e)
        return res.status(400).json({
            error: e
        });
    }
});

//送出訂單
// http://localhost:3000/order/12
router.post('/:order_id', async (req, res) => {
    let formData = req.body;
    const orderId = req.params['order_id']
    await dbOperations.appendOrderFoods(orderId, formData)
    await dbOperations.calculateOrder(orderId)
    // try {
    const [orders] = await pool.query(
        `SELECT id, trade_no, food_price, service_fee, trade_amt, created_at FROM table_orders WHERE id = ?`,
        [orderId]
    );
    if (orders.length === 0) {
        return res.send('Order not found');
    }

    const orderInfo = orders[0];
    console.log("orderInfo", orderInfo)

    const [orderItems] = await pool.query(
        `SELECT od.food_id, od.quantity, od.unit_price, f.name 
                FROM orders_items od 
                JOIN foods f ON od.food_id = f.id 
                WHERE od.order_id = ?`,
        [orderInfo.id]
    );
    console.log("orderItems",orderItems)

    const formattedDate = TimeFormat(orderInfo.created_at)
    // console.log("formattedDate",formattedDate); // 輸出格式可能與上面略有不同，依瀏覽器和地區設定而定

    const orderData = {
        orderNumber: orderId,
        orderDate: formattedDate,
        items: orderItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: item.quantity * item.unit_price
        })),
        subTotal: orderInfo.food_price,
        tax: orderInfo.service_fee,
        total: orderInfo.trade_amt,
        // specialRequests: '牛肉片請分開盛裝。'
    };
    try {
        printOrder(orderData)
    } catch (e) {
        // console.log(e)
    }
    return res.status(200).send(true);
    // } catch (e) {
    //     return res.status(400).json({
    //         error: e
    //     });
    // }
});

//刪除訂單品項
router.delete('/foods/:order_id/:food_id', async (req, res) => {
    const order_id = req.params['order_id']
    const food_id = req.params['food_id']

    try {
        var result = await dbOperations.deleteOrderFood(order_id, food_id)
        // console.log('delete result', result)
        return res.status(200).json(true);
    } catch (e) {
        return res.status(400).json({
            error: e
        });
    }
});

// 取得訂單產品
// http://localhost:3000/order/list/12
router.get('/list/:order_id', async (req, res) => {
    const orderId = req.params['order_id']
    // console.log('foods')
    try {
        var foods = await dbOperations.getOrderFoods(orderId)
        // console.log('foods', foods)
        return res.status(200).json(foods);
    } catch (e) {
        return res.status(400).json({
            error: e
        });
    }
});

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


// // 創建主訂單 V
// router.post('/master-order', (req, res) => {
//     // 傳入參數 桌號
//     // 判斷現在桌號有無人使用(是否有未結帳定訂單) 有就不開新訂單 否則開新訂單
//     const { userId, items, tableNumber } = req.body;
//     // 返回 建立失敗
//     // 返回建立成功 訂單ID 訂單資訊
//     const isSuccess = printOrderWithQR(url + orderid, orderid, tableNumber, contents);

//     res.json({
//         success: true,
//         orderId: "order123",
//     });
// });

// // 修改主訂單
// router.post('/modify-master-order', (req, res) => {
//     // 傳入參數 桌號 修改內容(狀態 已結帳 已取消 未結帳{用餐中})
//     // 
//     const { userId, items, tableNumber } = req.body;
//     // 返回修改成功或失敗 訂單ID
//     res.json({
//         success: true,
//         orderId: "order123",
//     });
// });

// // 提交子訂單 V
// router.post('/sub-order/:master-order-id', (req, res) => {
//     // 傳入參數 主訂單ID 菜品ID 數量 總金額
//     // 確認主訂單是否未結帳 是則建立子訂單 否則不提交
//     // 確認該菜品是否有庫存 是否存在 否則不提交
//     // 返回成功或者失敗 子訂單ID
//     const { userId, items, tableNumber } = req.body;
//     // 新建子訂單
//     // 新建子訂單及品項、數量、是否取消對照表
//     const isSuccess = printOrder(orderData);

//     res.json({
//         success: true,
//         orderId: "order123",
//     });
// });

// // 修改子訂單
// router.post('/modify-sub-order', (req, res) => {
//     // 傳入參數 主訂單ID 子訂單ID 修改內容(狀態 已取消)
//     const { userId, items, tableNumber } = req.body;
//     // 返回修改成功或失敗 訂單ID
//     res.json({
//         success: true,
//         orderId: "order123",
//     });
// });

// // 獲取所有訂單
// router.get('/orders', (req, res) => {
//     // 返回所有主訂單資訊

//     const { orderId } = req.query;
//     const order = orders[orderId];
//     if (order) {
//         const orderInfo = {
//             orderId: orderId,
//             items: order.items.map(item => {
//                 const dish = dishes.find(d => d.dishId === item.dishId);
//                 return {
//                     ...item,
//                     name: dish ? dish.name : "未知菜品",
//                     price: dish ? dish.price : 0,
//                     totalPrice: dish ? dish.price * item.quantity : 0
//                 };
//             }),
//             totalQuantity: order.items.reduce((acc, item) => acc + item.quantity, 0),
//             totalPrice: order.items.reduce((acc, item) => {
//                 const dish = dishes.find(d => d.dishId === item.dishId);
//                 return acc + (dish ? dish.price * item.quantity : 0);
//             }, 0)
//         };
//         res.json({ success: true, orderInfo });
//     } else {
//         res.json({ success: false, message: "取得所有訂單" });
//     }
// });

// // 獲取特定訂單的詳細資訊 V
// router.get('/master-order', (req, res) => {
//     const { orderId } = req.query;
//     // 傳入 主訂單ID
//     // 返回 完整訂單資料
//     res.json({
//         success: true,
//         orderId: orderId,
//         status: "取得訂單資料"
//     });
// });

// // 獲取特定訂單的詳細資訊 V
// router.get('/sub-order', (req, res) => {
//     const { orderId } = req.query;
//     // 傳入 主訂單ID
//     // 返回 完整子訂單資料
//     res.json({
//         success: true,
//         orderId: orderId,
//         status: "取得訂單資料"
//     });
// });
