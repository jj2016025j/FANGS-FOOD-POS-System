// 取得桌號
// 傳入order.table_number 更改
let getSeatNum = () => {
    // let seatNum =  localStorage.getItem("seatNum"); 
    document.getElementById("table-number").innerHTML = order.table_number;
}

//傳入訂單品項 生成位置 生成訂單品項
let generateOrderItem = (dom) => {

    if (order_foods.length !== 0) {
        //cart not empty
        return dom.innerHTML = order_foods.map((x) => {
            let id = x.food_id;
            let search = projectDataList.find((y) => y.id === id) || [];

            return `
                <div class="order-item">
                    <img class="order-item-img" src=${search.img} alt="">
                    <div class="order-info">
                        <div class="order-info-title">${search.product}</div>
                        <div> $ ${search.price}</div>
                    </div>
                    <div class="order-item-quantity">${x.quantity}</div>
                </div>
            `
        }).join("")
    }
    else {
        //cart empty
        dom.innerHTML = `
        <div class="no-item"><h4>訂單是空的唷</h4></div>
        `;
    }
}

//傳入清潔費% 訂單內容 計算訂單金額 並送出
let getOrderPrice = (fee) => {
    let orderPrice = document.getElementById("order-price");
    let serviceFee = document.getElementById("service-fee");
    let orderTotal = document.getElementById("order-total");

    if (order_foods.length !== 0) {
        let amount = order_foods.map((x) => {
            let id = x.food_id;
            let search = projectDataList.find((y) => y.id === id) || [];
            return x.quantity * search.price;
        }).reduce((x, y) => x + y, 0);

        orderPrice.innerHTML = `$ ${amount}`;
        serviceFee.innerHTML = `$ ${Math.round(amount * fee / 100)}`
        orderTotal.innerHTML = `$ ${amount + Math.round(amount * fee / 100)}`

    }
    else {
        orderPrice.innerHTML = `$ 0`;
        serviceFee.innerHTML = `$ 0`;
        orderTotal.innerHTML = `$ 0`;
    }
}

let makeChartData = (data) => {
    // 建立數據圖表
    new Chart(
        document.getElementById('bar-chart-content'),
        {
            type: 'line',
            data: {
                labels: data.map(row => row.month),
                datasets: [
                    {
                        label: '月營業額',
                        data: data.map(row => row.price),
                        // backgroundColor: [
                        //     'rgba(255, 99, 132, 0.2)',
                        //     'rgba(255, 159, 64, 0.2)',
                        //     'rgba(255, 205, 86, 0.2)',
                        //     'rgba(75, 192, 192, 0.2)',
                        //     'rgba(54, 162, 235, 0.2)',
                        //     'rgba(153, 102, 255, 0.2)',
                        //     'rgba(201, 203, 207, 0.2)'
                        // ],
                        // borderColor: [
                        //     'rgb(255, 99, 132)',
                        //     'rgb(255, 159, 64)',
                        //     'rgb(255, 205, 86)',
                        //     'rgb(75, 192, 192)',
                        //     'rgb(54, 162, 235)',
                        //     'rgb(153, 102, 255)',
                        //     'rgb(201, 203, 207)'
                        // ],
                        borderWidth: 1
                    }]
            }
        }
    );
}

// if (order) getSeatNum();
// if (order_foods) getOrderPrice(10);
// let orderList = document.getElementById("order-list");
// if (order_foods) generateOrderItem(orderList)
if (ChartData) makeChartData(ChartData);

