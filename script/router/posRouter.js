const express = require('express');
const router = express.Router();
const dbOperations = require('../../mynodesql'); 

// 點餐首頁
// http://localhost:3000/pos
router.get('/', async (req, res) => {
    console.log("進入pos系統首頁")
    var orders = await dbOperations.getPendingTableOrders();
    console.log("取得訂單")
    return res.render('pos', {
        orders: orders
    });
});

//進入點餐畫面
// http://localhost:3000/pos/:trade_no
router.get('/order/:trade_no', async (req, res) => {
    // console.log("pos")
    var categories = await dbOperations.getFoodCateories()
    var foods = await dbOperations.getFoods()
    var order = await dbOperations.getOrderByTradeNo(req.params['trade_no']);
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
    var foods = await dbOperations.getFoods();
    var categories = await dbOperations.getFoodCateories();
    var order = await dbOperations.getOrderByTradeNo(trade_no);

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
// http://localhost:3000/pos/edit
router.get('/edit', async (req, res) => {
    // console.log("edit")
    var categories = await dbOperations.getFoodCateories()
    var foods = await dbOperations.getFoods()
    return res.render('edit', {
        categories: categories,
        foods: foods
    });
});

// 後臺數據
// http://localhost:3000/pos/report
router.get('/report', async (req, res) => {
    // console.log("edit")
    const report = await dbOperations.getReport()
    const foods = await dbOperations.getFoodsWithTrash()
    return res.render('report', {
        report: report,
        foods: foods
    });
});

//確認付款畫面
router.get('/confirmpayment/:order_id', async (req, res) => {
    const order_id = req.params['order_id'];
    const order = await dbOperations.getOrderById(order_id);
    if (!order || order.order_status != 1) {
        return res.status(200).send('此訂單不存在或已完成結帳！');
    } else {
        const foods = await dbOperations.getFoods();
        const order_foods = await dbOperations.getOrderFoods(order_id);
        return res.render('confirm_payment', {
            order: order,
            order_foods: order_foods,
            foods: foods
        });
    }
});




module.exports = router;
