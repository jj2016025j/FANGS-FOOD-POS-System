require('dotenv').config()
const express = require('express');
const app = express();
<<<<<<< Updated upstream
const port = 5001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
const path = require('path');
app.set('views', path.join(__dirname, 'views'));

//導航到home
// http://localhost:5001
app.get('/', (req, res) => {
    res.redirect('/home');
})

// http://localhost:5001/home
app.get("/home", function (req, res) {
    res.render("home.ejs");
})

// 付款測試用
// http://localhost:5001/index
app.get("/index", function (req, res) {
    res.render("index.ejs", { user: req.user });//不用設定 views 路徑，會自動找到views路徑底下的檔案，有app.set('view engine', 'ejs')的話可以不用打附檔名
})

// http://localhost:5001/seatHome
app.get("/seathome", function (req, res) {
    res.sendFile(__dirname + "/public/menu/seatHome/seatHome.html")
})

// const kitchenRouter = require('./script/router/kitchenRouter');
// app.use('/kitchen', kitchenRouter);

// const orderRouter = require('./script/router/orderRouter');
// app.use('/order', orderRouter);

// const dataRouter = require('./script/router/dataRouter');
// app.use('/data', dataRouter);

// http://localhost:5001/menu
// const menuRouter = require('./script/router/menuRouter');
// app.use('/menu', menuRouter);

// 手機點餐路由
// http://localhost:5001/mobile
// const mobileRouter = require('./script/router/mobileRouter'); 
// app.use('/mobile', mobileRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// app.use(login);

=======
const mysql = require('mysql');
const dataRep = require('./script/router/data_repository');
const bodyParser = require('body-parser')


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.set('view engine', 'ejs');
const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

app.use(express.static('public'))

// 網站路由
// http://localhost:3000/
const webRouter = require('./script/router/webRouter');
app.use('/', webRouter);

// 404
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

// 404
app.get('/order', async(req, res) => {
    return res.send('請透過Qrcode掃描進入點餐!');
});

// pos
// http://localhost:3000/pos
const posRouter = require('./script/router/posRouter');
app.use('/pos', posRouter);

// http://localhost:3000/menu
// http://localhost:5001/menu
const menuRouter = require('./script/router/menuRouter');
app.use('/menu', menuRouter);

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
    console.log('Server is running on http://localhost:3000');
});
>>>>>>> Stashed changes
