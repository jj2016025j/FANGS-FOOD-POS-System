let getSeatNum = () => {
    let seatNum =  localStorage.getItem("seatNum");
    document.getElementById("table-number").innerHTML = seatNum;
}
getSeatNum();

let basket = JSON.parse(localStorage.getItem("data")) || [] ;

let orderList = document.getElementById("order-list");
//生成訂單品項
let generateOrderItem = (dom) => {
    //dom參數
    if (basket.length !== 0){
        //cart not empty
        return dom.innerHTML = basket.map((x) => {
            let {id , item} = x;//物件解構賦值變數
            
            let search = projectDataList.find((y) => y.id === id) || [];
            // console.log(search);
            return `
                <div class="order-item">
                    <img class="order-item-img" src=${search.img} alt="">
                    <div class="order-info">
                        <div class="order-info-title">${search.product}</div>
                        <div> $ ${search.price}</div>
                    </div>
                    <div class="order-item-quantity">${item}</div>
                </div>
            `
        }).join("")
    }
    else {
        //cart empty
        dom.innerHTML = `
        <div class="no-item"><h4>購物車是空的唷</h4></div>
        `;
    }
}
generateOrderItem(orderList)

//計算訂單金額
let getOrderPrice = (fee) => {
    let orderPrice = document.getElementById("order-price");
    let serviceFee = document.getElementById("service-fee");
    let orderTotal = document.getElementById("order-total");
    
    if (basket.length !== 0) {
        let amount = basket.map((x) => {
            let {id, item} = x;
            let search = projectDataList.find((y) => y.id === id) || [];
            return item * search.price;
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


