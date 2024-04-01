const express = require('express');
const router = express.Router();
const dbOperations = require('../../mynodesql');

// 點餐首頁
// http://localhost:3000/pos
router.get('/', async (req, res) => {
    console.log("進入pos系統首頁")
    var AllTableStatus = await dbOperations.getAllTableStatus();
    console.log("取得訂單")
    return res.json(AllTableStatus);
});

//進入點餐畫面
// http://localhost:3000/pos/:mainOrderId
router.get('/pos/:mainOrderId', async (req, res) => {
    const MainOrderId = req.params['mainOrderId']
    var MainOrderInfo = await dbOperations.getMainOrderInfoById(MainOrderId)
    return res.json(MainOrderInfo);
});

// http://localhost:3000/pos/phone/:mainOrderId
router.get('/pos/:mainOrderId', async (req, res) => {
    const MainOrderId = req.params['mainOrderId']
    var MainOrderInfo = await dbOperations.getMainOrderInfoById(MainOrderId)
    return res.json(MainOrderInfo);
});

// 品項編輯
// http://localhost:3000/pos/edit
router.get('/edit', async (req, res) => {
    // console.log("edit")
    var categories = await dbOperations.getMenuItemCateories()
    var menuItems = await dbOperations.getMenuItems()
    return res.json({
        categories: categories,
        menuItems: menuItems
    });
});

// 後臺數據
// http://localhost:3000/pos/report
router.get('/report', async (req, res) => {
    // console.log("edit")
    const report = await dbOperations.getBackEndData('all', 'all', 'month')
    return res.json({
        report: report
    });
});

//確認付款畫面
router.get('/confirmpayment/:mainOrderId', async (req, res) => {
    const MainOrderId = req.params['mainOrderId'];
    const MainOrderInfo = await dbOperations.getMainOrderInfoById(MainOrderId);
    if (!MainOrderInfo || MainOrderInfo.order_status != "未結帳") {
        return res.status(200).send('此訂單不存在或已完成結帳！');
    } else {
        await dbOperations.editMainOrderStatus(MainOrderId, "已結帳")
        return res.json({
            MainOrderInfo: MainOrderInfo
        });
    }
});

module.exports = router;
