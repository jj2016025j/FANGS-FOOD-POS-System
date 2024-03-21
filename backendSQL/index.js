require('dotenv').config()
const express = require('express');
const mysql = require('mysql');
const app = express();
const dataRep = require('./data_repository');
const bodyParser = require('body-parser')
const multer  = require('multer')
const foodsUpload = multer({
    dest: "./public/uploads/tmp"
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.set('view engine', 'ejs');
// Create MySQL connection
const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

//public assetes
app.use(express.static('public'))

// 手機掃描端
app.get('/', (req, res) => {
    return res.redirect('/order');
});
app.get('/order/:trade_no', async(req, res) => {
    const trade_no = req.params['trade_no'];
    var foods = await dataRep.getFoods();
    var categories = await dataRep.getFoodCateories();
    var order = await dataRep.getOrderByTradeNo(trade_no);

    if(order){
        return res.render('pages/order/index', {
            foods: foods,
            categories: categories,
            order: order
        });
    }else{
        return res.send('訂單不存在唷!');
    }
});
app.get('/order', async(req, res) => {
    return res.send('請透過Qrcode掃描進入點餐!');
});

/**
 * 商家平板端
 */
app.get('/shop', (req, res) => {
    return res.redirect('/shop/tables');
});

//報表
app.get('/shop/report', async(req, res) => {
    const report = await dataRep.getReport()
    const foods = await dataRep.getFoodsWithTrash()
    return res.render('pages/report/index', {
        report: report,
        foods: foods
    });
});

//食材管理
app.get('/shop/foodEditor', async(req, res) => {
    var categories = await dataRep.getFoodCateories()
    var foods = await dataRep.getFoods()
    return res.render('pages/food_edit/index', {
        categories: categories,
        foods: foods
    });
});

//座位管理
app.get('/shop/tables', async(req, res) => {
    var orders = await dataRep.getPendingTableOrders();
    return res.render('pages/tables/index', {
        orders: orders
    });
});

//座位訂單編輯
app.get('/shop/tableOrder/:trade_no', async(req, res) => {
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
app.get('/shop/orderConfirmPayment/:order_id', async(req, res) => {
    const order_id = req.params['order_id'];
    const order = await dataRep.getOrderById(order_id);
    if(!order || order.order_status != 1){
        return res.status(200).send('此訂單不存在或已完成結帳！');
    }else{
        const foods = await dataRep.getFoods();
        const order_foods = await dataRep.getOrderFoods(order_id);
        return res.render('pages/order_confirm_payment/index', {
            order: order,
            order_foods: order_foods,
            foods: foods
        });
    }
});

/**
 * API
 */
//新增食物
app.post('/api/foods', foodsUpload.single('item-img'), async(req, res) => {
    let formData = req.body;

    await dataRep.uploadFood(formData, req.file)

    return res.status(200).send(formData);
});
//編輯食物
app.post('/api/foods/:id', foodsUpload.single('item-img'), async(req, res) => {
    const id = req.params['id']
    let formData = req.body;
    await dataRep.editFood(id, formData, req.file)

    return res.status(200).send(true);
});
//刪除食物
app.delete('/api/foods/:id', async(req, res) => {
    const id = req.params['id']
    await dataRep.deleteFood(id)

    return res.status(200).send(true);
});
//刪除食物
app.delete('/api/order/foods/:order_id/:food_id', async(req, res) => {
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
});
//新增訂單
app.post('/api/table/order', async(req, res) => {
    let formData = req.body;
    const tableNum = formData.seatID

    try{
        await dataRep.addTableOrder(tableNum)
        var orders = await dataRep.getPendingTableOrders();
        return res.status(200).json(orders);
    }catch(e){
        return res.status(400).json({
            error: e
        });
    }
});
//設定訂單品項
app.post('/api/order/foods/append/:order_id', async(req, res) => {
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
//訂單產品
app.get('/api/order/foods/:order_id', async(req, res) => {
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
//現金結帳
app.post('/api/order/payConfirm/cash/:order_id', async(req, res) => {
    const orderId = req.params['order_id']
    try{
        await dataRep.confirmPaymentByCash(orderId)
        return res.status(200).send(true);
    }catch(e){
        return res.status(400).json({
            error: e
        });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
