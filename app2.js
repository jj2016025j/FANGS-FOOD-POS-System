const express = require('express');
const app = express();
const port = 5001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
const path = require('path');
app.set('views', path.join(__dirname, 'views'));

// 付款測試用
// http://localhost:5001/index
app.get("/index", function (req, res) {
    res.render("index.ejs", { user: req.user });//不用設定 views 路徑，會自動找到views路徑底下的檔案，有app.set('view engine', 'ejs')的話可以不用打附檔名
})

// http://localhost:5001/seatHome
app.get("/seathome", function (req, res) {
    res.sendFile(__dirname + "/public/menu/seatHome/seatHome.html")
})

// const orderRouter = require('./script/router/orderRouter');
// app.use('/order', orderRouter);

// const dataRouter = require('./script/router/dataRouter');
// app.use('/data', dataRouter);

// 手機點餐路由
// http://localhost:5001/mobile
// const mobileRouter = require('./script/router/mobileRouter'); 
// app.use('/mobile', mobileRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
