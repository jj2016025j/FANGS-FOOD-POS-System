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
router.get('/uncompleted', (req, res) => {
    const uncompletedOrders = Object.values(orders).filter(order => order.status !== "已完成");
    res.json({ success: true, orders: uncompletedOrders });
});

// 更新訂單狀態API
router.post('/update-status', (req, res) => {
    const { orderId, status } = req.body;
    if (orders[orderId]) {
        orders[orderId].status = status;
        res.json({ success: true, message: "訂單狀態更新成功" });
    } else {
        res.json({ success: false, message: "訂單不存在" });
    }
});

// 修改訂單內容API
router.post('/modify', (req, res) => {
    const { orderId, modifications } = req.body;
    let order = orders[orderId];
    if (order) {
        modifications.forEach(modification => {
            const { action, dishId, quantity } = modification;
            const dishIndex = order.dishes.findIndex(dish => dish.dishId === dishId);
            if (action === "add") {
                if (dishIndex > -1) {
                    order.dishes[dishIndex].quantity += quantity;
                } else {
                    // 假設這裡添加了一個新菜品，實際應用中應該從菜單數據獲取完整信息
                    order.dishes.push({ dishId, name: "新添加的菜品", quantity });
                }
            } else if (action === "remove" && dishIndex > -1) {
                order.dishes.splice(dishIndex, 1);
            }
        });
        res.json({ success: true, message: "訂單修改成功", order });
    } else {
        res.json({ success: false, message: "訂單不存在" });
    }
});

// 獲取訂單詳情API
router.get('/details', (req, res) => {
    const { orderId } = req.query;
    const order = orders[orderId];
    if (order) {
        res.json({ success: true, order });
    } else {
        res.json({ success: false, message: "訂單不存在" });
    }
});

module.exports = router;