// $.get("/menulist", function(data) {
            
// })


let menuMeat = document.getElementById("meat");
let menuSeafood = document.getElementById("seafood");
let menuVegetable = document.getElementById("vegetable");
let menuDumplings = document.getElementById("dumplings");
let menuHotpot = document.getElementById("hotpot");

let meatType = projectDataList.filter((x) => {return x.type === "meat"});
let seafoodType = projectDataList.filter((x) => {return x.type === "seafood"});
let vegetableType = projectDataList.filter((x) => {return x.type === "vegetable"});
let dumplingsType = projectDataList.filter((x) => {return x.type === "dumplings"});
let hotpotType = projectDataList.filter((x) => {return x.type === "hotpot"});

let basket = JSON.parse(localStorage.getItem("data")) || [] ;


//桌號顯示
let displaySeatNum = () => {
    let seatNum = localStorage.getItem("seatNum");
    document.getElementById("table-number").innerHTML = seatNum;
}
displaySeatNum()


// 生成品項
let generateMenuCard = (dom, datalist) => {
    return dom.innerHTML = datalist.map((x) => {//slice選取projectDataList內部分物件
        let {img, product, price, id} = x;
        //從本機儲存裡找資料
        let search = basket.find((x) => x.id === id) || [];
        return `
            <div class="col-md-6">
                <div class="item">
                        <div class="mycard">
                            <img class="menu-img" src=${img} alt="project-pic"/>
                            <div class="mycard-body">
                                <div class="body-info">
                                    <h4 class="card-title">${product}</h4>
                                    <p class="card-text">$${price}</p>
                                </div>
                                <div class="card-btn-group">
                                    <i class="bi bi-dash" onclick="decrement(${id})"></i>
                                    <div id=${id} class="item-count">${search.item === undefined ? 0 : search.item}</div>
                                    <i class="bi bi-plus" onclick="increment(${id})"></i>
                                </div>
                            </div>
                        </div>   
                </div>
            </div>
        `
    }).join("")
}
generateMenuCard(menuMeat, meatType);
generateMenuCard(menuSeafood, seafoodType);
generateMenuCard(menuVegetable, vegetableType);
generateMenuCard(menuDumplings, dumplingsType);
generateMenuCard(menuHotpot, hotpotType);

// 品項類別選單
function openMenu(pageName) {
    var i, tabcontent;
  
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    
    document.getElementById(pageName).style.display = "block";   
}
// 預設開啟類別
document.getElementById("defaultOpen").click();


//增量數量函式

let increment = (id) => {
    // console.log(id);return;
    let productItem = id;

    let search = basket.find((x) => { return x.id === productItem.id})

    if (search === undefined) {
        basket.push({
            id: productItem.id,
            item: 1,
        });
    }
    else{
        search.item += 1;
    }
    updata(productItem.id);
    generateCartItem(cartList);
    cartTotal();
    generateOrderItem()

    localStorage.setItem("data", JSON.stringify(basket));
};

//減量數量函式
let decrement = (id) => {
    let productItem = id;
    
    let search = basket.find((x) => { return x.id === productItem.id})


    if (search === undefined) {
        return;
    }
    else if (search.item === 0) {
        return;
    }
    else{
        search.item -= 1;
    }
    // console.log(basket);
    updata(productItem.id);
    //移除數量為0的物件
    basket = basket.filter((x) => x.item !== 0);//回傳此條件為true的物件
    
    generateCartItem(cartList);
    cartTotal();
    generateOrderItem()

    localStorage.setItem("data", JSON.stringify(basket));
};

//更新函式input值
let updata = (id) => {
    let search = basket.find((x) => x.id === id);
    
    if (search !== undefined) {
        document.getElementById(id).innerHTML = search.item;
    }
    else {
        document.getElementById(id).innerHTML = 0;
    }
};

//生成購物車商品
let cartList = document.getElementById("cart-list");

let generateCartItem = (dom) => {
    //dom參數
    let cartBtnContent = document.getElementById("cart-btn-content");
    if (basket.length !== 0){
        //cart not empty
        return dom.innerHTML = basket.map((x) => {
            let {id , item} = x;//物件解構賦值變數
            cartBtnContent.style.display = "block"
            let search = projectDataList.find((y) => y.id === id) || [];
            // console.log(search);
            return `
            <div class="cart-item">
                <img class="cart-item-img" src=${search.img} alt="">
                <div class="cart-info">
                    <p class="cart-info-title">${search.product}</p>
                    <div class="price">
                        <p>$ ${search.price} x ${item} = ${search.price * item}</p>
                    </div>
                </div>
                <i onclick="removeItem(${id})" class="bi bi-trash"></i>
            </div>
            `
        }).join("")
    }
    else {
        //cart empty
        cartBtnContent.style.display = "none"
        dom.innerHTML = `
        <div class="no-item"><h4>購物車是空的唷</h4></div>
        `;
    }
}

generateCartItem(cartList);

//刪除購物車品項
let removeItem = (id) => {
    let productItem = id;
    //移除物件
    basket = basket.filter((x) => x.id !== productItem.id);
    
    updata(productItem.id)
    generateCartItem(cartList);
    cartTotal();

    localStorage.setItem("data", JSON.stringify(basket));
}

//購物車訂單數量顯示
let cartTotal = () => {
    let cartQuantity = document.getElementsByClassName("cart-quantity");
    let itemAmount = basket.map((x) => x.item).reduce((x, y) => x + y, 0);
    for (let i = 0; i < cartQuantity.length; i++) {
        cartQuantity[i].innerHTML = itemAmount
    }
}
cartTotal();

// 送出訂單按鈕
let sentOrderBtn = () => {
    let cartBtnList = document.getElementsByClassName("cart-btn");
    for (let i = 0; i < cartBtnList.length; i++) {
        cartBtnList[i].addEventListener("click", () => {
            if (cartBtnList[i].id) {
                $.ajax({
                    url: "",
                    method: "POST",
                    data: JSON.stringify(basket),
                    contentType: "application/json",
                    success: (result) => {
                        basket = [];
                        console.log(result)
                    }
                })

                console.log("notsent")
            }else {
                $.ajax({
                    url: "",
                    method: "POST",
                    data: JSON.stringify(basket),
                    contentType: "application/json",
                    success: (result) => {
                        basket = [];
                        console.log(result)
                    }
                })

                console.log("sent")
            }
    
            basket = [];
            localStorage.setItem("data", JSON.stringify(basket));
            generateOrderItem();
            generateCartItem(cartList);
            generateMenuCard(menuMeat, meatType);
            generateMenuCard(menuSeafood, seafoodType);
            generateMenuCard(menuVegetable, vegetableType);
            generateMenuCard(menuDumplings, dumplingsType);
            
        })  
    }
}
sentOrderBtn();

//生成訂單品項
let generateOrderItem = () => {
    let orderList = document.getElementById("order-list")
    // $.get("url", function(data) {
    //     if (data.length !== 0){
    //         //cart not empty
    //         return orderList.innerHTML = data.map((x) => {
    //             let {id , item} = x;//物件解構賦值變數
                
    //             let search = projectDataList.find((y) => y.id === id) || [];
    //             // console.log(search);
    //             return `
    //                 <div class="order-item">
    //                     <div class="order-info">
    //                         <p class="order-info-title">${search.product}</p>
    //                         <div class="order-info-price">$${search.price}</div>
    //                     </div>
    //                     <div class="order-info-quantity"><span>${item}</span></div>
    //                     <i onclick="deleteOrder(${id})" class="bi bi-trash"></i>
    //                 </div>
    //             `
    //         }).join("")
    //     }
    //     else {
    //         //cart empty
            
    //         orderList.innerHTML = `
    //         <div class="no-item"><h4>訂單是空的唷</h4></div>
    //         `;
    //     }     
    // })

    if (basket.length !== 0){
        //cart not empty
        return orderList.innerHTML = basket.map((x) => {
            let {id , item} = x;//物件解構賦值變數
            
            let search = projectDataList.find((y) => y.id === id) || [];
            // console.log(search);
            return `
                <div class="order-item">
                    <div class="order-info">
                        <p class="order-info-title">${search.product}</p>
                        <div class="order-info-price">$${search.price}</div>
                    </div>
                    <div class="order-info-quantity"><span>${item}</span></div>
                    <i onclick="deleteOrder(${id})" class="bi bi-trash"></i>
                </div>
            `
        }).join("")
    }
    else {
        //cart empty
        
        orderList.innerHTML = `
        <div class="no-item"><h4>訂單是空的唷</h4></div>
        `;
    }
}
generateOrderItem();

let openOrderPage = () => {
    document.getElementById("open-order-btn").addEventListener("click",() => 
    {
        let orderPage = document.getElementById("order-page");
        orderPage.style.transform = "translateX(0%)"
    })
}
openOrderPage();

let closeOrderPage = () => {
    document.getElementById("close-order-btn").addEventListener("click", () => 
    {
        let orderPage = document.getElementById("order-page");
        orderPage.style.transform = "translateX(100%)"
    })
}
closeOrderPage();

