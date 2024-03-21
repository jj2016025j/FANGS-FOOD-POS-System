require('dotenv').config()
const express = require('express');
const mysql = require('mysql');
const app = express();
const dataRep = require('./script/router/data_repository');
const bodyParser = require('body-parser')
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.use(express.static('public'))

// 網站路由
// http://localhost:3000/
const webRouter = require('./script/router/webRouter');
app.use('/', webRouter);

// pos
// http://localhost:3000/pos
const posRouter = require('./script/router/posRouter');
app.use('/pos', posRouter);

// http://localhost:3000/menu
// http://localhost:5001/menu
const menuRouter = require('./script/router/menuRouter');
app.use('/menu', menuRouter);

// http://localhost:3000/order
const orderRouter = require('./script/router/orderRouter');
app.use('/order', orderRouter);

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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

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
