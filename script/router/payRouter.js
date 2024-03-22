const express = require('express');
const router = express.Router();
const { printInvoice, initPrinter } = require('../printer');
const mysql = require('mysql2/promise');
const dataRep = require('../data_repository');

// 数据库连接配置
const pool = mysql.createPool({
    host: "localhost", // 資料庫伺服器地址
    user: "root", // 資料庫用戶名
    password: "", // 資料庫密碼
    database: "fang_project", // 要操作的数据库名 庫名不一定要
    charset: "utf8mb4", // 確保使用 utf8mb4
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
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
    const isSuccess = printInvoice(invoiceData);

    res.json({ success: isSuccess, message: "發票已開具", invoice });
});

//現金結帳
router.post('/:order_id', async (req, res) => {
    const orderId = req.params['order_id']
    try {
        const [orders] = await pool.query(
            `SELECT id, trade_no, food_price, service_fee, trade_amt, created_at FROM table_orders WHERE id = ?`,
            [orderId]
        );
        if (orders.length === 0) {
            return res.status(404).send('Order not found');
        }

        const orderInfo = orders[0];
        console.log(orderInfo)

        const [orderItems] = await pool.query(
            `SELECT od.food_id, od.quantity, od.unit_price, f.name 
                FROM orders_items od 
                JOIN foods f ON od.food_id = f.id 
                WHERE od.order_id = ?`,
            [orderInfo.id]
        );
        console.log(orderItems)
        const defaultInvoiceData = {
            dateTime: orderInfo.created_at,
            invoicePeriod: '10404',
            items: orderItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unit_price,
                totalPrice: item.quantity * item.unit_price
            })),
            subTotal: orderInfo.food_price,
            tax: orderInfo.service_fee,
            total: orderInfo.trade_amt,
            date: '1100301',
            salesAmount: '00002710',
            encryptionInfo: 'encryptedStringHere',
            selfUseArea: '**********',
            itemCount: '5',
            encoding: '1',
            products: 'LED顯示器:1:500:無;無線鍵盤:2:750:無',
        };
        console.log(defaultInvoiceData)

        await dataRep.confirmPaymentByCash(orderId)
        // console.log(orderId)
        try {
            initPrinter()
            printInvoice(invoiceData)
        } catch (e) {
            console.log(e)
        }
        return res.status(200).send(true);
    } catch (e) {
        return res.status(400).json({
            error: e
        });
    }
});

// POST /linepay/:trade_no 路由处理
// http://localhost:3000/pay/linepay/:trade_no
router.post('/linepay/:trade_no', async (req, res) => {
    const tradeNo = req.params.trade_no;

    try {
        // 查询订单基本信息
        const [orders] = await pool.query(
            `SELECT id, trade_no, trade_amt FROM table_orders WHERE trade_no = ?`,
            [tradeNo]
        );
        console.log(orders)
        if (orders.length === 0) {
            return res.status(404).send('Order not found');
        }

        const orderInfo = orders[0]; // 直接取得订单对象

        // 查询订单项详情
        const [orderItems] = await pool.query(
            `SELECT od.food_id, od.quantity, od.unit_price, f.name 
            FROM orders_items od 
            JOIN foods f ON od.food_id = f.id 
            WHERE od.order_id = ?`,
            [orderInfo.id] // 使用订单ID查询详情
        );
        console.log(orderItems)
        // 转换为LinePay格式
        const linepayData = {
            orderId: orderInfo.trade_no,
            amount: orderInfo.trade_amt,
            currency: "TWD",
            packages: [
                {
                    id: "1",
                    amount: orderInfo.trade_amt,
                    products: orderItems.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.unit_price
                    }))
                }
            ]
        };

        // 返回LinePay格式数据
        res.json(linepayData);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).send('Server Error');
    }
});

router.post('/linepay/:trade_no', (req, res) => {

    const linePay = {
        amount: 1000,
        currency: "TWD",
        packages: [
            {
                id: "products_1",
                amount: 1000,
                products: [
                    {
                        name: "測試產品1",
                        quantity: 1,
                        price: 1000,
                    },
                ],
            },
        ],
    }

})

router.post('creditcard', (req, res) => {

})

module.exports = router;