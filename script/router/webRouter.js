const express = require('express');
const router = express.Router();

// http://localhost:3000/
router.get('/', (req, res) => {
    return res.send('成功進入首頁');
});

router.get('/', (req, res) => {
    res.render('index');
})

// http://localhost:3000/home
router.get("/home", function (req, res) {
    res.render("home");
})

// http://localhost:3000/news
router.get('/news', (req, res) => {
    res.render('news');
})

// http://localhost:3000/menu_base
router.get('/menu_base', (req, res) => {
    res.render('menu_base');
})

// http://localhost:3000/menu_meat
router.get('/menu_meat', (req, res) => {
    res.render('menu_meat');
})

// http://localhost:3000/contactus
router.get('/contactus', (req, res) => {
    res.render('contactus');
})

// http://localhost:3000/aboutus
router.get('/aboutus', (req, res) => {
    res.render('aboutus');
})

router.get('/qa', (req, res) => {
    res.render('qa');
})

router.get('/menber', (req, res) => {
    res.render('menber');
})





router.get('/home', (req, res) => {
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

router.get('/menu', (req, res) => {
    // 假設這些菜品數據存在於先前的實現中
    res.json({ success: true, data: dishes });
});

router.get('/menu/dishes/:dishId', (req, res) => {
    const { dishId } = req.params;
    const dish = dishes.find(d => d.dishId === dishId);
    if (dish) {
        res.json({ success: true, data: dish });
    } else {
        res.json({ success: false, message: "菜品不存在" });
    }
});

router.get('/about', (req, res) => {
    const aboutUsContent = {
        history: '火鍋店成立於xxxx年，擁有豐富的歷史與文化。',
        philosophy: '我們致力於提供最優質的食材和服務。',
        services: ['特色火鍋', '個人定制鍋底', '健康蔬菜選擇']
    };
    res.json({ success: true, data: aboutUsContent });
});

router.get('/contact', (req, res) => {
    const contactInfo = {
        location: 'xx市xx路xx號',
        phone: '123-456-7890',
        hours: '每日 10:00 - 22:00'
    };
    res.json({ success: true, data: contactInfo });
});

router.get('/stores', (req, res) => {
    const storesInfo = [
        { storeId: '1', location: 'xx市xx路xx號', contact: '123-456-7890', hours: '每日 10:00 - 22:00' },
        // 其他門市資訊...
    ];
    res.json({ success: true, data: storesInfo });
});

module.exports = router;