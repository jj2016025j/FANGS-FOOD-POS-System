const express = require('express');
const router = express.Router();
const dataRep = require('./data_repository');

// 點餐首頁
// http://localhost:3000/pos
router.get('/', async (req, res) => {
    var orders = await dataRep.getPendingTableOrders();
    return res.render('home', {
        orders: orders
    });
});

//新增訂單
router.post('/', async(req, res) => {
    let formData = req.body;
    const tableNum = formData.seatID

    try{
        await dataRep.addTableOrder(tableNum)
        var orders = await dataRep.getPending   ();
        return res.status(200).json(orders);
    }catch(e){
        return res.status(400).json({
            error: e
        });
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

//進入點餐畫面
// http://localhost:3000/pos/order
router.get('/order/:trade_no', async (req, res) => {
    var categories = await dataRep.getFoodCateories()
    var foods = await dataRep.getFoods()
    var order = await dataRep.getOrderByTradeNo(req.params['trade_no']);
    return res.render('pages/tables_order/index', {
        categories: categories,
        foods: foods,
        order: order
    });
});

//確認付款
router.get('/shop/orderConfirmPayment/:order_id', async (req, res) => {
    const order_id = req.params['order_id'];
    const order = await dataRep.getOrderById(order_id);
    if (!order || order.order_status != 1) {
        return res.status(200).send('此訂單不存在或已完成結帳！');
    } else {
        const foods = await dataRep.getFoods();
        const order_foods = await dataRep.getOrderFoods(order_id);
        return res.render('pages/order_confirm_payment/index', {
            order: order,
            order_foods: order_foods,
            foods: foods
        });
    }
});




module.exports = router;
