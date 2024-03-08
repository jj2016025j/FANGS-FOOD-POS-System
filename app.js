const express = require('express');
// const kitchenRouter = require('./script/router/kitchenRouter'); // 確保路徑正確
// const orderRouter = require('./script/router/orderRouter'); // 確保路徑正確
// const dataRouter = require('./script/router/dataRouter'); // 確保路徑正確
// const webRouter = require('./script/router/webRouter'); // 確保路徑正確
const menuRouter = require('./script/router/menuRouter'); // 確保路徑正確
const app = express();
const port = 3000;

app.use(express.json());
// app.use('/kitchen', kitchenRouter);
// app.use('/order', orderRouter);
// app.use('/data', dataRouter);
// app.use('/web', webRouter);
app.use('/menu', menuRouter);
 
// http://localhost:3000/Index
app.get("/Index", function (req, res) {
    res.render("Index.ejs");//不用設定 views 路徑，會自動找到views路徑底下的檔案，有app.set('view engine', 'ejs')的話可以不用打附檔名
})

//導航到home
app.get('/', (req, res) => {
    res.redirect('/web');
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});







// app.use(login);