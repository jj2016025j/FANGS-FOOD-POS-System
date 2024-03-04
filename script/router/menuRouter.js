const express = require('express');
const pool = require('./dbPool'); // 假設你已經有一個設定好的MySQL連接池
const router = express.Router();

// 獲取菜單列表
router.get('/menu', (req, res) => {
    const { category } = req.query;
    let query = 'SELECT * FROM MenuItems WHERE IsActive = 1';
    const params = [];

    if (category) {
        query += ' AND CategoryId = ?';
        params.push(category);
    }

    pool.query(query, params, (error, results) => {
        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
        res.json({ success: true, data: results });
    });
});

// 新增菜單項目
router.post('/items', (req, res) => {
    const { Name, Description, Price, CategoryId, IsActive } = req.body;
    const sql = 'INSERT INTO MenuItems (Name, Description, Price, CategoryId, IsActive, CreateTime, UpdateTime) VALUES (?, ?, ?, ?, ?, NOW(), NOW())';

    pool.query(sql, [Name, Description, Price, CategoryId, IsActive], (error, results) => {
        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
        res.status(201).json({ success: true, message: '新增菜單成功', MenuItemId: results.insertId });
    });
});

// 修改菜單項目
router.put('/items/:itemId', (req, res) => {
    const { itemId } = req.params;
    const { Name, Description, Price, CategoryId, IsActive } = req.body;
    const sql = 'UPDATE MenuItems SET Name = ?, Description = ?, Price = ?, CategoryId = ?, IsActive = ?, UpdateTime = NOW() WHERE MenuItemId = ?';

    pool.query(sql, [Name, Description, Price, CategoryId, IsActive, itemId], (error, results) => {
        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '菜單項目未找到' });
        }
        res.json({ success: true, message: '修改菜單成功' });
    });
});

// 刪除菜單項目
router.delete('/items/:itemId', (req, res) => {
    const { itemId } = req.params;
    const sql = 'DELETE FROM MenuItems WHERE MenuItemId = ?';

    pool.query(sql, [itemId], (error, results) => {
        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '菜單項目未找到' });
        }
        res.json({ success: true, message: '刪除菜單成功' });
    });
});

module.exports = router;
