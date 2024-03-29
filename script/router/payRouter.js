const express = require('express');
const router = express.Router();
const axios = require("axios");
const hmacSHA256 = require("crypto-js/hmac-sha256");
const Base64 = require("crypto-js/enc-base64");
const dotenv = require("dotenv");
dotenv.config();

const { printInvoice, convertToInvoiceFormat } = require('../printer');
const { TimeFormat } = require('../timeFormatted.js')
const mysql = require('mysql2/promise');
const dbOperations = require('../../mynodesql'); 

const {
    MYSQL_HOST,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_DATABASE,
    LINEPAY_CHANNEL_ID,
    LINEPAY_RETURN_HOST,
    LINEPAY_SITE,
    LINEPAY_VERSION,
    LINEPAY_CHANNEL_SECRET_KEY,
    LINEPAY_RETURN_CONFIRM_URL,
    LINEPAY_RETURN_CANCEL_URL,
} = process.env;

// console.log(LINEPAY_CHANNEL_ID, LINEPAY_RETURN_HOST, LINEPAY_SITE, LINEPAY_VERSION, LINEPAY_CHANNEL_SECRET_KEY, LINEPAY_RETURN_CONFIRM_URL, LINEPAY_RETURN_CANCEL_URL)
// 数据库连接配置
const pool = mysql.createPool({
    host: MYSQL_HOST, // 資料庫伺服器地址
    user: MYSQL_USER, // 資料庫用戶名
    password: MYSQL_PASSWORD, // 資料庫密碼
    database: MYSQL_DATABASE, // 要操作的数据库名 庫名不一定要
    charset: "utf8mb4", // 確保使用 utf8mb4
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

//現金結帳
router.post('/cash/:order_id', async (req, res) => {
    const orderId = req.params['order_id']
    try {
        const [orders] = await pool.query(
            `SELECT id, trade_no, food_price, service_fee, trade_amt, created_at FROM table_orders WHERE id = ?`,
            [orderId]
        );
        if (orders.length === 0) {
            return res.json('Order not found');
        }

        const orderInfo = orders[0];
        // console.log(orderInfo)

        const [orderItems] = await pool.query(
            `SELECT od.food_id, od.quantity, od.unit_price, f.name 
                FROM orders_items od 
                JOIN foods f ON od.food_id = f.id 
                WHERE od.order_id = ?`,
            [orderInfo.id]
        );
        // console.log("orderItems", orderItems)

        const formattedDate = TimeFormat(orderInfo.created_at)
        // console.log("formattedDate", formattedDate); // 輸出格式可能與上面略有不同，依瀏覽器和地區設定而定

        const invoiceData = {
            dateTime: formattedDate,
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
            products: convertToInvoiceFormat(orderItems),
        };
        // console.log(invoiceData)

        await dbOperations.confirmPaymentByCash(orderId)
        // // console.log(orderId)
        try {
            printInvoice(invoiceData)
        } catch (e) {
            // console.log(e)
        }
        return res.status(200).send(true);
    } catch (e) {
        return res.status(400).json({
            error: e
        });
    }
});

// POST /linepay/:trade_no 路由处理
// http://localhost:5000/pay/linepay/:trade_no
router.post("/linepay/:id", async (req, res) => {
    const id = req.params.id;

    try {
        // 查询订单基本信息
        const [orders] = await pool.query(
            `SELECT id, trade_no, trade_amt FROM table_orders WHERE id = ?`,
            [id]
        );
        //   // console.log(orders);
        if (orders.length === 0) {
            return res.status(404).send("Order not found");
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
        // // console.log(orderItems)
        // 转换为LinePay格式
        const linepayData = {
            orderId: orderInfo.trade_no,
            amount: orderInfo.trade_amt,
            currency: "TWD",
            packages: [
                {
                    id: "1",
                    amount: orderInfo.trade_amt,
                    products: [
                        {
                            name: "芳鍋",
                            quantity: 1,
                            price: orderInfo.trade_amt,
                        },
                    ],
                },
            ],
        };
        // // console.log(linepayData)
        // // console.log(linepayData.packages[0].products)

        const linePayBody = createLinePayBody(linepayData);
        //   // console.log(linePayBody);
        // CreateSignature 建立加密內容
        const uri = "/payments/request";
        const headers = createSignature(uri, linePayBody);
        const url = `${LINEPAY_SITE}/${LINEPAY_VERSION}${uri}`;
        const linePayRes = await axios.post(url, linePayBody, { headers });
        //   // console.log(url, linePayRes.data.returnCode);
        // 請求成功...
        if (linePayRes?.data?.returnCode === "0000") {
            res.json({ paymentUrl: linePayRes.data.info.paymentUrl.web });
        } else {
            res.status(400).send({
                message: "訂單不存在",
            });
        }

    } catch (err) {
        console.error(`Error: ${err.message}`);
        res.status(500).send('Server Error');
        // console.log(err);
    }
});

// http://localhost:5000/pay/lineConfirm
router.get("/lineConfirm", async (req, res) => {
    const { transactionId, orderId } = req.query;
    //   // console.log(orderId);
    try {
        const [orders] = await pool.query(
            `SELECT id, trade_no, trade_amt FROM table_orders WHERE trade_no = ?`,
            [orderId]
        );

        const linePayBody = {
            amount: orders[0].trade_amt,
            currency: "TWD",
        };
        // console.log(linePayBody);
        const uri = `/payments/${transactionId}/confirm`;
        const headers = createSignature(uri, linePayBody);
        const url = `${LINEPAY_SITE}/${LINEPAY_VERSION}${uri}`;
        const linePayRes = await axios.post(url, linePayBody, { headers });
        // // console.log(linePayRes);
        if (linePayRes?.data?.returnCode === "0000") {
            res.redirect(`/pay/success/${orderId}`);
        } else {
            res.status(400).send({
                message: linePayRes,
            });
        }
    } catch (err) {
        // console.log(err);
    }
});

router.get("/success/:orderId", async (req, res) => {
    const { orderId } = req.params;
    const [orders] = await pool.query(
        `SELECT id, trade_no, trade_amt FROM table_orders WHERE trade_no = ?`,
        [orderId]
    );
    // console.log(orders);
    // console.log(orders.id);
    await dbOperations.confirmPaymentByCash(orders[0].id);
    res.redirect("/pos");
});

// http://localhost:5000/pay/creditcard/:trade_no
router.post('/creditcard/:order_id', async (req, res) => {
    // const orderId = req.params['trade_no']
    const orderId = req.params['order_id']

    await dbOperations.confirmPaymentByCash(orderId)

    res.json(orderId);
})

// 一鍵結帳全部
// http://localhost:5000/pay/checkout
router.post('/checkout', async (req, res) => {
    // try {
    var results = await dbOperations.OneClickCheckoutAll();
    return res.status(200).json(results);
    // } catch (error) {
    //     console.error(error);
    //     return res.status(500).json({ message: "Internal server error" });
    // }
});

function createLinePayBody(order) {
    return {
        ...order,
        currency: "TWD",
        redirectUrls: {
            confirmUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CONFIRM_URL}`,
            cancelUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CANCEL_URL}`,
        },
    };
}

function createSignature(uri, linePayBody) {
    const nonce = new Date().getTime();
    const encrypt = hmacSHA256(
        `${LINEPAY_CHANNEL_SECRET_KEY}/${LINEPAY_VERSION}${uri}${JSON.stringify(
            linePayBody
        )}${nonce}`,
        LINEPAY_CHANNEL_SECRET_KEY
    );
    const signature = Base64.stringify(encrypt);

    const headers = {
        "X-LINE-ChannelId": LINEPAY_CHANNEL_ID,
        "Content-Type": "application/json",
        "X-LINE-Authorization-Nonce": nonce,
        "X-LINE-Authorization": signature,
    };
    return headers;
}

module.exports = router;



// // 結帳
// router.post('/pay', (req, res) => {
//     const { orderId, paymentMethod, amount } = req.body;
//     const receiptId = `receipt${Object.keys(orders).length + 1}`;
//     const receipt = {
//         receiptId,
//         amount,
//         paymentMethod,
//         status: "已支付"
//     };
//     orders[orderId].receipt = receipt;
//     // 返回支付成功或失敗
//     res.json({ success: true, message: "支付成功", receipt });
// });

// // 發票開具 X
// router.post('/invoice', (req, res) => {
//     const { orderId, receiptId, invoiceType, carrier } = req.body;
//     const invoiceId = `invoice${Object.keys(orders).length + 1}`;
//     const invoice = {
//         invoiceId,
//         orderId,
//         receiptId,
//         invoiceType,
//         carrier,
//         status: "已開具"
//     };
//     if (orders[orderId]) orders[orderId].invoice = invoice;
//     const isSuccess = printInvoice(invoiceData);

//     res.json({ success: isSuccess, message: "發票已開具", invoice });
// });