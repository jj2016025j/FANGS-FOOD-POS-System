const express = require('express');
const kitchenRouter = require('./script/kitchenRouter'); // 確保路徑正確
const orderRouter = require('./script/orderRouter'); // 確保路徑正確
const dataRouter = require('./script/dataRouter'); // 確保路徑正確
const app = express();
const port = 3000;

app.use(express.json());
app.use('/kitchen', kitchenRouter);
app.use('/order', orderRouter);
app.use('/data', dataRouter);
//導航到home
app.get('/', (req, res) => {
    res.redirect('/home');
})

app.get('/home', (req, res) => {
    // 示範數據，實際應用中可能來自於數據庫或其他服務
    const homeContent = {
        brandImage: 'url_to_image',
        latestActivities: [
            { title: '活動1', description: '活動1詳情', image: 'url_to_image1' },
            { title: '活動2', description: '活動2詳情', image: 'url_to_image2' }
        ],
        promotions: [
            { title: '促銷1', details: '促銷1詳情' },
            { title: '促銷2', details: '促銷2詳情' }
        ],
        recommendedDishes: [
            { dishId: '1', name: '牛肉片', price: 50, image: 'url_to_dish_image', rating: 4.5 }
            // 其他推薦菜品...
        ]
    };
    // res.json({ success: true, data: homeContent });
    res.json({ data: "這是首頁" });
});

app.get('/menu', (req, res) => {
    // 假設這些菜品數據存在於先前的實現中
    res.json({ success: true, data: dishes });
});

app.get('/menu/dishes/:dishId', (req, res) => {
    const { dishId } = req.params;
    const dish = dishes.find(d => d.dishId === dishId);
    if (dish) {
        res.json({ success: true, data: dish });
    } else {
        res.json({ success: false, message: "菜品不存在" });
    }
});

app.get('/about', (req, res) => {
    const aboutUsContent = {
        history: '火鍋店成立於xxxx年，擁有豐富的歷史與文化。',
        philosophy: '我們致力於提供最優質的食材和服務。',
        services: ['特色火鍋', '個人定制鍋底', '健康蔬菜選擇']
    };
    res.json({ success: true, data: aboutUsContent });
});

app.get('/contact', (req, res) => {
    const contactInfo = {
        location: 'xx市xx路xx號',
        phone: '123-456-7890',
        hours: '每日 10:00 - 22:00'
    };
    res.json({ success: true, data: contactInfo });
});

app.get('/stores', (req, res) => {
    const storesInfo = [
        { storeId: '1', location: 'xx市xx路xx號', contact: '123-456-7890', hours: '每日 10:00 - 22:00' },
        // 其他門市資訊...
    ];
    res.json({ success: true, data: storesInfo });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
