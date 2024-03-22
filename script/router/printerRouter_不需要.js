const express = require('express');
const router = express.Router();
const dataRep = require('./script/router/data_repository');
const { printOrder, printOrderWithQR, printInvoice } = require('./script/printer');

// 打印點餐QRCODE
router.post('/printer-qrcode', (req, res) => {
    const { url, orderid, tableNumber } = req.body;

    const contents = ["本店酌收清潔費10%", "手機掃碼 立即點餐", "Fangs Food 芳鍋", "祝您用餐愉快"]
    // 打印點餐QRCODE
    const isSuccess = printOrderWithQR(url + orderid, orderid, tableNumber, contents);

    res.json({
        success: isSuccess,
    });
});

// 打印訂單
router.post('/printer-order', (req, res) => {
    const { orderNumber, items, tableNumber } = req.body;

    const orderData = {
        orderNumber: orderNumber,
        tableNumber: tableNumber,
        orderDate: '2024-03-19',
        address: '台北市大安區忠孝東路100號',
        phone: '02-9876-5432',
        items: items,
        total: 1250,
        serviceChargeRate: 10,
        serviceCharge: 125,
        paymentMethod: '信用卡',
        specialRequests: '牛肉片請分開盛裝。'
    };

    // 打印訂單
    const isSuccess = printOrder(orderData);

    res.json({
        success: isSuccess,
    });
});

// 打印發票
router.post('/printer-invoice', (req, res) => {
    const invoiceData = {
        header: 'FangFood 芳鍋',
        dateTime: '2024-03-18 11:22:33',
        invoicePeriod: '10404',
        invoiceNumber: 'AB-12345678',
        randomCode: '1234',
        totalAmount: '100',
        sellerId: '53589318',
        buyerId: '79461349',
        companyInfo: '芳鍋企業有限公司',
        address: '台北市信義區市府路1號',
        phone: '02-1234-5678',
        items: [
            { name: 'LED顯示器', quantity: 1, unitPrice: 5000, totalPrice: 5000 },
            { name: '無線鍵盤', quantity: 2, unitPrice: 700, totalPrice: 1400 }
        ],
        subTotal: '6400',
        tax: '320',
        total: '6720',
        returnPolicyTexts: [
            '退換貨政策: ',
            '商品購買後30天內可退換，',
            '需保持商品完整包裝。'
        ],
        date: '1100301',
        salesAmount: '00002710', // 未稅銷售額，十六進位
        encryptionInfo: 'encryptedStringHere', // 假設的加密資訊
        selfUseArea: '**********', // 營業人自行使用區
        itemCount: '5',
        encoding: '1', // UTF-8編碼
        products: 'LED顯示器:1:500:無;無線鍵盤:2:750:無',
    };
    // 打印發票
    const isSuccess = printInvoice(invoiceData);

    res.json({
        success: isSuccess,
    });
});