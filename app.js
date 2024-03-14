const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

//導航到home
// http://localhost:3000
app.get('/', (req, res) => {
    res.redirect('/home');
})

// http://localhost:3000/home
app.get("/home", function (req, res) {
    res.render("home.ejs");
})
 
// http://localhost:3000/index
app.get("/index", function (req, res) {
    res.render("Index.ejs", { user: req.user });//不用設定 views 路徑，會自動找到views路徑底下的檔案，有app.set('view engine', 'ejs')的話可以不用打附檔名
})



// const kitchenRouter = require('./script/router/kitchenRouter'); // 確保路徑正確
// app.use('/kitchen', kitchenRouter);

// const orderRouter = require('./script/router/orderRouter'); // 確保路徑正確
// app.use('/order', orderRouter);

// const dataRouter = require('./script/router/dataRouter'); // 確保路徑正確
// app.use('/data', dataRouter);

// const webRouter = require('./script/router/webRouter'); // 確保路徑正確
// app.use('/web', webRouter);

// const menuRouter = require('./script/router/menuRouter'); // 確保路徑正確
// app.use('/menu', menuRouter);
// http://localhost:3000/menu

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// app.use(login);