const express = require('express');
const router = express.Router();
const dbOperations = require('../../pos_mysql');

router.use(express.json());

router.get('/all', async (req, res) => {
    // 後臺數據
    // http://localhost:8080/data/all
    const SellData = await dbOperations.getBackEndData('all', 'all', 'month')
    res.json(SellData);
})

router.get('/lastMonth', async (req, res) => {
    // 獲取後臺資料 V
    // http://localhost:8080/data/lastMonth
    const SellData = await dbOperations.getBackEndData('lastMonth', 'byItem')
    res.json(SellData);
});

module.exports = router;