const express = require('express');
const dbOperations = require('../mynodesql'); // 假設你已經有一個設定好的MySQL連接池
const router = express.Router();
const dataRep = require('../data_repository');
const multer = require('multer')
const foodsUpload = multer({
    dest: "./public/uploads/tmp"
});

const storyName = "fangs_food_"
// dbOperations.createDatabase("pos_system")
// dbOperations.useDatabase('pos_system');

// 用於確認路由器連接成功
// http://localhost:5001/menu
router.get('/', (req, res) => {
    res.render("menu.ejs");//不用設定 views 路徑，會自動找到views路徑底下的檔案，有router.set('view engine', 'ejs')的話可以不用打附檔名
})

// http://localhost:5001/menu/items
router.get('/items', async (req, res) => {
    try {
        // 直接等待异步方法的结果
        const results =
            await dbOperations.selectFromTable(
                "MenuItemId, Name, Description, Price, CategoryId, InSupply",
                "MenuItems"
            );
        res.json(results); // 将结果发送回客户端
    } catch (error) {
        // 处理可能发生的任何错误
        console.error(error);
        res.status(500).send('Server error'); // 发送一个服务器错误响应
    }
});

const Items = {
    MenuItemId: 20,
    Name: "Name",
    Description: "Description",
    Price: 0.33,
    CategoryId: 2,
    Insupply: true,
    PostmanTest: false
};
// // 新增菜單項目
// // http://localhost:5001/menu/items
// router.post('/items', async (req, res) => {
//     // req.body = Items.PostmanTest ? Items : req.body;
//     const Items = req.body
//     try {
//         // 直接等待异步方法的结果
//         const results = await dbOperations.insertIntoMenuItems(Items)
//         res.status(201).send("成功插入資料, 插入的ID: " + results.insertId);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server error');
//     }
// });

// // 修改菜單項目
// // http://localhost:5001/menu/items
// router.put('/items', async (req, res) => {
//     req.body = Items.PostmanTest ? Items : req.body;
//     const Item = req.body
//     try {
//         // 直接等待异步方法的结果
//         const results = await dbOperations.updateMenuItems(Item)
//         res.status(201).send("更新資料成功，影響的行數：" + results.affectedRows);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server error');
//     }
// });

// // 刪除菜單項目
// // http://localhost:5001/menu/items
// router.delete('/items', async (req, res) => {
//     req.body = Items.PostmanTest ? Items : req.body;
//     const Item = req.body
//     console.log(req.body)
//     try {
//         // 直接等待异步方法的结果
//         const results = await dbOperations.deleteMenuItems(Item)
//         res.status(201).send("刪除資料成功，影響的行數：" + results.affectedRows);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server error');
//     }
// });

//新增品項
// http://localhost:5001/menu
router.post('/', foodsUpload.single('item-img'), async (req, res) => {
    let formData = req.body;

    await dataRep.uploadFood(formData, req.file)

    return res.status(200).send(formData);
});

//編輯品項
router.put('/:id', foodsUpload.single('item-img'), async (req, res) => {
    const id = req.params['id']
    let formData = req.body;
    await dataRep.editFood(id, formData, req.file)

    return res.status(200).send(true);
});

//刪除品項
router.delete('/:id', async (req, res) => {
    const id = req.params['id']
    await dataRep.deleteFood(id)

    return res.status(200).send(true);
});

module.exports = router;
