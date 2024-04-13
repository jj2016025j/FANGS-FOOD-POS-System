const express = require('express');
const router = express.Router();
const axios = require("axios");
const hmacSHA256 = require("crypto-js/hmac-sha256");
const Base64 = require("crypto-js/enc-base64");
const dotenv = require("dotenv");
dotenv.config();

const { printInvoice, convertToInvoiceFormat } = require('../printer');
const { TimeFormat } = require('../timeFormatted.js')
const dbOperations = require('../../pos_mysql');

const {
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
let pool
(async () => {
    pool = await dbOperations.getConnection()
})
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
router.put('/checkoutAll', async (req, res) => {
    try {
        var results = await dbOperations.checkOutALL();
        return res.status(200).json(results);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/checkout/:mainOrderId', async (req, res) => {
    // 確認付款 UNDO 應該要改成function
    // http://localhost:8080/pay/checkout/ORD-1709679600000-3
    try {
        const MainOrderId = req.params['mainOrderId'];
        const MainOrderInfo = await dbOperations.getMainOrderInfoById(MainOrderId);
        console.log(MainOrderInfo)
        if (!MainOrderInfo) {
            return res.status(500).json({
                message: '此訂單不存在',
                MainOrderInfo: MainOrderInfo
            });

        } else if (MainOrderInfo.OrderStatus != "未結帳") {
            await dbOperations.editTableInfo(TableId, "清潔中", "")
            return res.status(200).json({
                message: `訂單 ${MainOrderId} 已結帳`,
                MainOrderInfo: MainOrderInfo
            });
        } else {
            const TableId = await dbOperations.getTableIdByMainOrderId(MainOrderId)
            console.log(TableId)
            await dbOperations.editTableInfo(TableId, "清潔中", "")
            const results = await dbOperations.editMainOrderStatus(MainOrderId, "已結帳")
            console.log(results)
            if (results) {
                return res.json({
                    message: `訂單 ${MainOrderId} 已完成結帳`
                });
            } else {
                return res.status(501).json({
                    message: `伺服器發生錯誤`
                });
            }
        }

    } catch {
        return res.status(501).json({
            message: `伺服器發生錯誤`
        });
    }
});

router.get('/cancelCheckout/:mainOrderId', async (req, res) => {
    // 取消付款
    // http://localhost:8080/pos/cancelCheckout/ORD-1709679600000-3
    const MainOrderId = req.params['mainOrderId'];
    const MainOrderInfo = await dbOperations.getMainOrderInfoById(MainOrderId);
    if (!MainOrderInfo || MainOrderInfo.OrderStatus != "已結帳") {
        return res.status(200).json({
            message: `此訂單 ${MainOrderId} 還未結帳！`,
            MainOrderInfo: MainOrderInfo
        });
    } else {
        const results = await dbOperations.editMainOrderStatus(MainOrderId, "未結帳")
        if (results) {
            return res.json({
                message: `訂單 ${MainOrderId} 已修改為未結帳`,
                MainOrderInfo: await dbOperations.getMainOrderInfoById(MainOrderId)
            });
        } else {
            return res.status(500).json({
                message: `伺服器發生錯誤`
            });
        }
    }
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