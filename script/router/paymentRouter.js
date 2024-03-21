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
});

// 發票開具 X
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

//現金結帳
router.post('/api/order/pay:order_id', async (req, res) => {
    const orderId = req.params['order_id']
    try {
        await dataRep.confirmPaymentByCash(orderId)
        return res.status(200).send(true);
    } catch (e) {
        return res.status(400).json({
            error: e
        });
    }
});

module.exports = router;