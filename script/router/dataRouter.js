const express = require('express');
const router = express.Router();
const dbOperations = require('../../pos_mysql');

router.use(express.json());

// 獲取後臺資料 V
router.get('/', async (req, res) => {
    // const { date } = req.bady;
    const SellData = await dbOperations.getBackEndData('lastMonth', 'byItem')

    res.json(SellData);
});

module.exports = router;