const express = require('express');
const router = express.Router();
const dataRep = require('../data_repository');

// 點餐首頁
// http://localhost:3000/pos
router.get('/', async (req, res) => {
    var orders = await dataRep.getPendingTableOrders();
    return res.render('pos', {
        orders: orders
    });
});

//進入點餐畫面
// http://localhost:3000/pos/:trade_no
router.get('/:trade_no', async (req, res) => {
    var categories = await dataRep.getFoodCateories()
    var foods = await dataRep.getFoods()
    var order = await dataRep.getOrderByTradeNo(req.params['trade_no']);
    return res.render('order', {
        categories: categories,
        foods: foods,
        order: order
    });
});
// 手機點餐
// http://localhost:3000/pos/phone/:trade_no
router.get('/phone/:trade_no', async (req, res) => {
    const trade_no = req.params['trade_no'];
    var foods = await dataRep.getFoods();
    var categories = await dataRep.getFoodCateories();
    var order = await dataRep.getOrderByTradeNo(trade_no);

    if (order) {
        return res.render('phone', {
            foods: foods,
            categories: categories,
            order: order
        });
    } else {
        return res.send('訂單不存在唷!');
    }
});

// 品項編輯
// http://localhost:3000/pos/Edit
router.get('/Edit', async (req, res) => {
    var categories = await dataRep.getFoodCateories()
    var foods = await dataRep.getFoods()
    return res.render('edit', {
        categories: categories,
        foods: foods
    });
});

// 後臺數據
// http://localhost:3000/pos/report
router.get('/report', async (req, res) => {
    const report = await dataRep.getReport()
    const foods = await dataRep.getFoodsWithTrash()
    return res.render('report', {
        report: report,
        foods: foods
    });
});

//確認付款
router.get('/confirmpayment/:order_id', async (req, res) => {
    const order_id = req.params['order_id'];
    const order = await dataRep.getOrderById(order_id);
    if (!order || order.order_status != 1) {
        return res.status(200).send('此訂單不存在或已完成結帳！');
    } else {
        const foods = await dataRep.getFoods();
        const order_foods = await dataRep.getOrderFoods(order_id);
        return res.render('confirm_payment', {
            order: order,
            order_foods: order_foods,
            foods: foods
        });
    }
});




module.exports = router;
