const express = require('express');
const router = express.Router();
const dbOperations = require('../../pos_mysql');


router.get("/:menuItemId", async function (req, res) {
    // 取得某個品項
    // http://localhost:8080/menu/12
    const menuItemId = req.params['menuItemId']
    const menuItemInfo = await dbOperations.getMenuItemInfo(menuItemId)
    res.json(menuItemInfo);
})

router.get('/', async (req, res) => {
    // 取得所有品項
    // http://localhost:8080/menu
    try {
        var categories = await dbOperations.getMenuItemCateories()
        var menuItems = await dbOperations.getMenuItems()
        return res.json({
            categories: categories,
            menuItems: menuItems
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

router.post('/', async (req, res) => {
    // 新增菜單項目
    // http://localhost:8080/menu
    const menuItem = req.body;
    try {
        const results = await dbOperations.insertIntoMenuItem(menuItem, menuItem.categoryId, menuItem.index);
        res.status(201).send("成功插入資料, 插入的ID: " + results.insertId);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


// 修改菜單項目
// http://localhost:8080/:menuitemId
router.put('/:menuitemId', async (req, res) => {
    const Item = req.body
    try {
        const results = await dbOperations.updateMenuItem(Item)
        res.status(201).send("更新資料成功，影響的行數：" + results.affectedRows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// 刪除菜單項目
// http://localhost:8080/:menuitemId
router.delete('/:menuitemId', async (req, res) => {
    const Item = req.body
    try {
        const results = await dbOperations.deleteMenuItems(Item)
        res.status(201).send("刪除資料成功，影響的行數：" + results.affectedRows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;

const Items = {
    MenuItemId: 20,
    Name: "Name",
    Description: "Description",
    Price: 0.33,
    CategoryId: 2,
    Insupply: true,
};
