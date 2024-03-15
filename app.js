const express = require('express');
const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
const path = require('path');
app.set('views', path.join(__dirname, 'views'));

//導航到home
// http://localhost:8080
app.get('/', (req, res) => {
    res.redirect('/home');
})

// http://localhost:8080/home
app.get("/home", function (req, res) {
    res.render("home.ejs");
})

// 付款測試用
// http://localhost:8080/index
app.get("/index", function (req, res) {
    res.render("index.ejs", { user: req.user });//不用設定 views 路徑，會自動找到views路徑底下的檔案，有app.set('view engine', 'ejs')的話可以不用打附檔名
})

// http://localhost:8080/seatHome
app.get("/seathome", function (req, res) {
    res.sendFile(__dirname + "/public/menu/seatHome/seatHome.html")
})

// const kitchenRouter = require('./script/router/kitchenRouter');
// app.use('/kitchen', kitchenRouter);

// const orderRouter = require('./script/router/orderRouter');
// app.use('/order', orderRouter);

// const dataRouter = require('./script/router/dataRouter');
// app.use('/data', dataRouter);

// const webRouter = require('./script/router/webRouter');
// app.use('/web', webRouter);

const menuRouter = require('./script/router/menuRouter');
app.use('/menu', menuRouter);
// http://localhost:8080/menu

// POS系統路由
// http://localhost:8080/pos
const posRouter = require('./script/router/posRouter');
app.use('/pos', posRouter);

// 手機點餐路由
// const mobileRouter = require('./script/router/mobileRouter'); 
// http://localhost:8080/mobile
// app.use('/mobile', mobileRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// app.use(login);

