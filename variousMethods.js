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
    randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min); // 加上 return
    },
    generateRandomOrders(startDateStr, endDateStr, tableCount, orderCount, projectDataList, itemQuantityRange, itemTypesRange) {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        const orders = [];

        for (let i = 0; i < orderCount; i++) {
            const orderDate = randomDate(startDate, endDate);
            const tableId = Math.ceil(Math.random() * tableCount);
            let subTotal = 0;

            const itemsCount = Math.floor(Math.random() * (itemTypesRange.max - itemTypesRange.min + 1)) + itemTypesRange.min;
            const orderMappings = [];

            for (let j = 0; j < itemsCount; j++) {
                const menuItem = projectDataList[Math.floor(Math.random() * projectDataList.length)];
                const quantity = Math.floor(Math.random() * (itemQuantityRange.max - itemQuantityRange.min + 1)) + itemQuantityRange.min;
                const total_price = menuItem.Price * quantity;

                orderMappings.push({
                    MenuItemName: menuItem.MenuItemName,
                    Category: menuItem.Category,
                    MenuItemId: j + 1, // 假設 MenuItemId
                    quantity,
                    unit_price: menuItem.Price,
                    total_price,
                });

                subTotal += total_price;
            }

            const serviceFee = Math.round(subTotal * 0.1);
            const total = subTotal + serviceFee;
            const MainOrderId = `ORD-${orderDate.getTime()}-${i}`;

            orders.push({
                MainOrderId,
                TableId: tableId,
                SubTotal: subTotal,
                ServiceFee: serviceFee,
                Total: total,
                OrderStatus: "未結帳",
                CreateTime: orderDate.toISOString().split('T')[0] + ' ' + orderDate.toISOString().split('T')[1].slice(0, 8),
                OrderMappings: orderMappings,
            });
        }

        return orders;
    },
    getGeneratedOrders() {
        const menuItemsData = require("./script/data/fangsFoodData.js")

        // Usage
        const itemQuantityRange = { min: 1, max: 3 };
        const itemTypesRange = { min: 2, max: 10 };

        const generatedOrders = variousMethods.generateRandomOrders(
            '2024-03-01', new Date(), 20, 1, menuItemsData, itemQuantityRange, itemTypesRange
        );

        // console.log(generatedOrders[0]);
        // {
        //     MainOrderId: 'ORD-1707354000000-0',
        //     TableId: 17,
        //     SubTotal: 1426,
        //     ServiceFee: 143,
        //     Total: 1569,
        //     OrderStatus: '未結帳',
        //     OrderMappings: [
        //       {
        //         MenuItemName: '松板豬肉片大200克',
        //         Category: 'dumplings',
        //         MenuItemId: 1,
        //         quantity: 2,
        //         unit_price: 638,
        //         total_price: 1276
        //       },
        //       {
        //         MenuItemName: '蟹肉丸',
        //         Category: 'dumplings',
        //         MenuItemId: 2,
        //         quantity: 3,
        //         unit_price: 50,
        //         total_price: 150
        //       }
        //     ]
        //   }
        return generatedOrders
    }
}




// // Example usage
// const orders = variousMethods.generateRandomOrders('2023-03-01', '2024-03-31', [300, 5000], 20, 1000);
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