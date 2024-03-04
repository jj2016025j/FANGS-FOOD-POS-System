const express = require('express');
const router = express.Router();

router.use(express.json());

// 獲取每日銷售額 API
router.get('/sales/daily-total', (req, res) => {
    const { date } = req.query;
    // 實際應用中，這裡應該有一段邏輯來從資料庫查詢指定日期的銷售總額
    res.json({
        date: date,
        totalSales: 10000 // 示意數值
    });
});

// 獲取菜品銷售數量 API
router.get('/sales/dishes', (req, res) => {
    const { period } = req.query;
    // 根據指定的時間範圍（日、週、月）從資料庫查詢菜品的銷售數量
    res.json([
        // 示意數據
        { dishId: "1", name: "牛肉片", quantitySold: 50 },
        { dishId: "2", name: "白菜", quantitySold: 30 }
    ]);
});

// 獲取菜品銷售排名 API
router.get('/sales/rankings', (req, res) => {
    const { period } = req.query;
    // 根據指定的時間範圍（日、週、月）從資料庫查詢菜品的銷售排名
    res.json([
        // 示意數據
        { rank: 1, dishId: "1", name: "牛肉片", sales: 5000 },
        { rank: 2, dishId: "2", name: "白菜", sales: 3000 }
    ]);
});

// 獲取顧客訂單數 API
router.get('/customers/orders-count', (req, res) => {
    // 從資料庫查詢每個顧客的訂單數
    res.json([
        // 示意數據
        { customerId: "1001", orderCount: 5 },
        { customerId: "1002", orderCount: 3 }
    ]);
});

// 獲取營運成本 API
router.get('/operations/costs', (req, res) => {
    const { period } = req.query;
    // 根據指定的時間範圍（月、年）從資料庫查詢營運成本
    res.json({
        period: period,
        foodCost: 2000,
        laborCost: 3000,
        rent: 5000,
        totalCost: 10000 // 示意數值
    });
});

// 獲取活動參與度 API
router.get('/marketing/participation', (req, res) => {
    const { campaignId } = req.query;
    // 從資料庫查詢指定活動的參與度
    res.json({
        campaignId: campaignId,
        participationCount: 150 // 示意數值
    });
});

router.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = router;