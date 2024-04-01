const express = require('express');
const router = express.Router();
const dbOperations = require('../../mynodesql');

// http://localhost:5001/menu
router.get('/', async (req, res) => {
    try {
        const results = await dbOperations.getAllMenuItems();
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error'); 
    }
});

// 新增菜單項目
// http://localhost:5001/menu
router.post('/', async (req, res) => {
    const Items = req.body
    try {
        const results = await dbOperations.insertIntoMenuItems(Items)
        res.status(201).send("成功插入資料, 插入的ID: " + results.insertId);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// 修改菜單項目
// http://localhost:5001/:menuitemId
router.put('/:menuitemId', async (req, res) => {
    const Item = req.body
    try {
        const results = await dbOperations.updateMenuItems(Item)
        res.status(201).send("更新資料成功，影響的行數：" + results.affectedRows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// 刪除菜單項目
// http://localhost:5001/:menuitemId
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
    PostmanTest: false
};
