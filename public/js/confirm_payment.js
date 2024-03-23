let getSeatNum = () => {
    // let seatNum =  localStorage.getItem("seatNum");
    document.getElementById("table-number").innerHTML = order.table_number;
}
getSeatNum();

// let basket = JSON.parse(localStorage.getItem("data")) || [] ;

let orderList = document.getElementById("order-list");
//生成訂單品項
let generateOrderItem = (dom) => {

    if (order_foods.length !== 0){
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
generateOrderItem(orderList)

//計算訂單金額
let getOrderPrice = (fee) => {
    let orderPrice = document.getElementById("order-price");
    let serviceFee = document.getElementById("service-fee");
    let orderTotal = document.getElementById("order-total");
    
    // $.get("/order/money", function(data) {

    // })

    if (order_foods.length !== 0) {
        let amount = order_foods.map((x) => {
            let id = x.food_id;
            let search = projectDataList.find((y) => y.id === id) || [];
            return x.quantity * search.price;
        }).reduce((x, y) => x + y ,0);

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
getOrderPrice(10);


$('#pay-cash-button').on('click', ()=> {
    $.ajax({
        url: "/pay/cash/" + order.id,
        method: "POST",
        success: (result) => {
            alert('結帳成功')
            location.href = "/pos"
        }
    })
})

$('#pay-credit-card-button').on('click', ()=> {
    $.ajax({
        url: "/pay/creditcard/" + order.id,
        method: "POST",
        success: (result) => {
            alert('結帳成功')
            location.href = "/pos"
        }
    })
})

$('#pay-line-pay-button').on('click', ()=> {
    $.ajax({
        url: "/pay/linepay/" + order.id,
        method: "POST",
        success: (result) => {
            alert('結帳成功')
            location.href = "/pos"
        }
    })
})