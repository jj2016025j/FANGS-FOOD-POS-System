const randomDate = (startDate, endDate) => {
    const date = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    date.setMinutes(0, 0, 0); // 将分钟和秒都设置为0
    return date;
}

const variousMethods = {
    generateOrderId: () => {
        // 你的自定義ID生成邏輯 ORD171169708446134y3p5jpr
        return 'ORD' + new Date().getTime() + Math.random().toString(36).substring(2, 15);
    },
    random: (lastNumber) => {
        //隨機生成1~lastNumber的整數
        return Math.floor(Math.random() * lastNumber) + 1;
    },
    generateOrders: (startDateStr, endDateStr, priceRange, tableCount, orderCount) => {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        const orders = [];

        for (let i = 0; i < orderCount; i++) {
            const createdDate = randomDate(startDate, endDate);
            const paymentDate = new Date(createdDate.getTime() + Math.random() * (2 * 60 * 60 * 1000)); // 假设支付时间在下单后的0-2小时内
            const orderTotal = Math.round(Math.random() * (priceRange[1] - priceRange[0]) + priceRange[0])
            orders.push({
                trade_no: `ORD${createdDate.getTime()}`,
                food_price: orderTotal,
                service_fee: Math.round(orderTotal * 0.1),
                trade_amt: 0, // 这里初始设置为0，下面计算真实值
                table_number: Math.ceil(Math.random() * tableCount),
                // order_status: Math.random() > 0.5 ? 1 : 2, // 随机假设订单状态为1或2
                order_status: 2, // 随机假设订单状态为1或2
                created_at: createdDate.toISOString().replace('T', ' ').substring(0, 19),
                payment_at: paymentDate.toISOString().replace('T', ' ').substring(0, 19),
            });
        }

        // 计算每个订单的总金额（食品价格加上服务费）
        orders.forEach(order => order.trade_amt = Math.round(order.food_price + order.service_fee));

        return orders;
    }
}

// 示例用法
const orders = generateRandomOrders('2023-03-01', '2024-03-31', [300, 5000], 20, 1000);
// console.log(orders);
// console.log(generateOrderId());
// console.log(new Date(),"2024-03-29T07:20:13.509Z");
// console.log(new Date().getTime(),"1711697084460");
// console.log(Math.random(),"0.6662227391230504");
// console.log(Math.random().toString(36),"0.5cn61ky20ig");
// console.log(Math.random().toString(36).substring(2, 15),"jeufhkadbid");
// console.log(Date.now(),"1711697084461");
// console.log(Math.random().toString(36).substring(4),"xuj6gzscr");
// console.log('ORD' + Date.now() + Math.random().toString(36).substring(4),"ORD171169708446134y3p5jpr");

module.exports = variousMethods;