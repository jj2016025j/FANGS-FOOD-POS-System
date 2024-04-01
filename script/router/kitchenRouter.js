// 暫時不用
const express = require('express');
const router = express.Router();

// 假設的訂單數據，實際應用中應該從數據庫中獲取
let orders = {
  "123456": {
    orderId: "123456",
    tableNumber: "5",
    dishes: [
      { dishId: "1", name: "牛肉片", quantity: 2 },
      { dishId: "2", name: "白菜", quantity: 1 }
    ],
    status: "正在準備"
  }
  // 其他訂單...
};

// 獲取即時訂單列表API
// http://localhost:5001/kitchen
router.get('/', (req, res) => {
    const { orderId } = req.query;
    const order = orders[orderId];
    const uncompletedOrders = Object.values(orders).filter(order => order.status !== "已完成");
    if (order) {
        res.json({ success: true, order });
    } else {
        res.json({ success: false, message: "訂單不存在" });
    }});

// 更新訂單狀態API
// http://localhost:5001/kitchen/:suborderid
router.post('/:suborderid', (req, res) => {
    const { orderId, status } = req.body;
    if (orders[orderId]) {
        orders[orderId].status = status;
        res.json({ success: true, message: "訂單狀態更新成功" });
    } else {
        res.json({ success: false, message: "訂單不存在" });
    }
});

module.exports = router;