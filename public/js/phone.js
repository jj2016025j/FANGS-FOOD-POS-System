//自動調整成符合手機畫面高度
let phoneHeight = () => {
    document.documentElement.style.setProperty('--doc-height', `${window.innerHeight}px`)
}
window.addEventListener("resize", phoneHeight);
phoneHeight();

let getTableNumber = () => {
    let tableNumber = document.getElementById("table-number");
    tableNumber.innerHTML = `桌號 ${order.table_number}`;
    return {
        tablenum: order.table_number,
        orderid: order.id
    };
}
getTableNumber();

// let getMenu = () => {
//     $.get("/menulist", function(data) {
//         projectDataList = data;
//     })
// };
// getMenu();

// let shopMeat = document.getElementById("shop-meat");
// let shopSeafood = document.getElementById("shop-seafood");
// let shopVegetable = document.getElementById("shop-vegetable");
// let shopDumplings = document.getElementById("shop-dumplings");
// let shopHotPot = document.getElementById("shop-hotPot");

// let meatType = projectDataList.filter((x) => {return x.type === "meat"});
// let seafoodType = projectDataList.filter((x) => {return x.type === "seafood"});
// let vegetableType = projectDataList.filter((x) => {return x.type === "vegetable"});
// let dumplingsType = projectDataList.filter((x) => {return x.type === "dumplings"});
// let hotPotType = projectDataList.filter((x) => {return x.type === "hotPot"});

let basket = JSON.parse(localStorage.getItem("data")) || [] ;
basket = basket.filter(item => {
    return projectDataList.find(x => x.id === item.id)
})

//品項生成
let generateMenuCard = (dom, datalist) => {
    return dom.innerHTML = datalist.map((x) => {//slice選取projectDataList內部分物件
        let {img, product, price, id} = x;
        //從本機儲存裡找資料
        let search = basket.find((x) => x.id === id) || [];
        return `
            <div class="col-12 col-lg-6" id=project-id-${id}>
                <div class="item">
                    <div class="mycard">
                        <img class="card-img" src=${img} alt="project-pic"/>
                        <div class="mycard-body">
                            <div class="body-info">
                                <h4 class="card-title">${product}</h4>
                                <p class="card-text">$${price}</p>
                            </div>
                            <div class="project-btn-group">
                                <i class="bi bi-dash" onclick="decrement(${id})"></i>
                                <div id=${id} class="project-count">${search.item === undefined ? 0 : search.item}</div>
                                <i class="bi bi-plus" onclick="increment(${id})"></i>
                            </div>
                        </div>
                    </div>   
                </div>
            </div>
        `
    }).join("")

}

let resetMenu = ()=> {
    categories.forEach((category)=> {
        var element = $('#category_inner_' + category.id).get(0)
        var foodsForType = projectDataList.filter((x) => {return x.type === category.id})
        generateMenuCard(element, foodsForType);
    })
}
resetMenu()

// generateMenuCard(shopMeat, meatType);
// generateMenuCard(shopSeafood, seafoodType);
// generateMenuCard(shopVegetable, vegetableType);
// generateMenuCard(shopDumplings, dumplingsType);

// 鍋物生成
let generateHotPotCard = (dom, datalist) => {
    return dom.innerHTML = datalist.map((x) => {
        let {img, product, price, id} = x;
        //從本機儲存裡找資料
        let search = basket.find((x) => x.id === id) || [];
        return `
            <div class="col-12 col-lg-6">
                <input type="radio" id=${id} name="hotPot" value=${id}>
                <label class="hotPot-label" for=${id} onclick="orderHotPot(${id})">
                    <span class="hotPot-radio"></span>
                    <img class="card-img" src="${img}"/>
                    <div class="body-info">
                        <h4 class="card-title">${product}</h4>
                        <p class="card-text">$${price}</p>
                    </div>
                </label>
            </div>
            
        `
    }).join("")
}
// generateHotPotCard(shopHotPot, hotPotType);

let orderHotPot = (id) => {
    //以訂單id去火鍋商品資料內核對
    let search = basket.find((x) => { 
        return hotPotType.find((y) => {
            return x.id === y.id
        })
    })

    if (search === undefined) {
        basket.push({
            id: id.id,
            item: 1,
        });
    }
    else{
        search.id = id.id
    }
    generateOrderItem();
    generateCartItem(cartContainer);
    generateCartButton();
    cartTotal();
    totalPrice();

    localStorage.setItem("data", JSON.stringify(basket));
}

//check box 顯示
// let itemChecked = () => {
//     let search = basket.find((x) => { 
//         return hotPotType.find((y) => {
//             return x.id === y.id
//         })
//     })

//     if (search === undefined) {
//         return
//     }
//     else{
//         document.getElementById(search.id).setAttribute("checked", "checked");
//     } 
// }
// itemChecked();

//增量數量函式

let increment = (id) => {
    // console.log(id);return;
    let productItem = projectDataList.find(item=> item.id == id);

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
    // generateOrderItem();
    generateCartItem(cartContainer);
    generateCartButton();
    localStorage.setItem("data", JSON.stringify(basket));
};

//減量數量函式
let decrement = (id) => {
    let productItem = projectDataList.find(item=> item.id == id);
    
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
    // generateOrderItem();
    generateCartItem(cartContainer);
    generateCartButton();
    localStorage.setItem("data", JSON.stringify(basket));
};

//更新函式input值
let updata = (id) => {
    let search = basket.find((x) => x.id === id);
    console.log(search)
    if (search !== undefined) {
        document.getElementById(id).innerHTML = search.item;
    }
    else {
        document.getElementById(id).innerHTML = 0;
    }
    
    
    cartTotal();
    totalPrice();
};


//購物車加總顯示
let cartTotal = () => {
    let orderCount = document.getElementById("order-count");
    let itemAmount = basket.map((x) => x.item).reduce((x, y) => x + y, 0);
    orderCount.innerText = itemAmount;
}

cartTotal();

//開關購物車

let openOrder = () => {
    let orderPage = document.getElementById("order-page");
    orderPage.style.transform = "translateX(0%)";

    let orderInfo = document.getElementById("order-info");
    if (orderInfo.style.display == "block") {
        orderInfo.style.display = "none";
    }else {
        return;
    }
    hideCart();
}

let closeOrder = () => {
    let orderPage = document.getElementById("order-page");
    orderPage.style.transform = "translateX(100%)";
    generateCartButton();
}

//訂單記錄畫面
let generateOrderItem = () => {
    let orderContent = document.getElementById("order-content");
    let orderPriceContent = document.getElementById("order-price-content");

    $.ajax({
        url: "/order/list/" + order.id,
        method: "GET",
        data: {},
        contentType: "application/json",
        success: (foods) => {
            if (foods.length !== 0){
                //cart not empty
                let total = foods.map((food) => {
                    return food.total_price;
                }).reduce((x, y) => x + y ,0);

                orderPriceContent.innerHTML = `
                    <div class="order-price-info">訂單金額:<span>$${total}</span></div>
                    <div class="order-price-info">服務費:<span>$${Math.round(total * 10 / 100)}</span></div>
                    <div class="order-price-info">總金額:<span>$${total + Math.round(total * 10 / 100)}</span></div>
                `;

                return orderContent.innerHTML = foods.map((x) => {
                    let id = x.food_id;
                    let search = projectDataList.find((y) => y.id === id) || [];
                    
                    return `
                    <div class="cart-item">
                        <img src=${search.img} alt="">
                        <div class="cart-info">
                            <p class="cart-info-title">${search.product}</p>
                            <div class="price">
                                <p>$ ${x.unit_price} x ${x.quantity} = ${x.total_price}</p>
                            </div>
                        </div>
                    </div>
                    `
                }).join("")
            }
            else {
                orderPriceContent.innerHTML = ``;
                orderContent.innerHTML = `
                <div class="no-item"><h4>無訂單紀錄</h4></div>
                `;
            }
        },
        error: ()=> {
            orderPriceContent.innerHTML = ``;
            orderContent.innerHTML = `
            <div class="no-item"><h4>發生錯誤</h4></div>
            `;
        }
    })

    // if (basket.length !== 0){
    //     //cart not empty
    //     let total = basket.map((x) => {
    //         let {id, item} = x;
    //         let search = projectDataList.find((y) => y.id === id) || [];
    //         return item * search.price;
    //     }).reduce((x, y) => x + y ,0);

    //     orderPriceContent.innerHTML = `
    //         <div class="order-price-info">訂單金額:<span>$${total}</span></div>
    //         <div class="order-price-info">服務費:<span>$${Math.round(total * 10 / 100)}</span></div>
    //         <div class="order-price-info">總金額:<span>$${total + Math.round(total * 10 / 100)}</span></div>
    //     `;

    //     return orderContent.innerHTML = basket.map((x) => {
    //         let {id , item} = x;//物件解構賦值變數
    //         let search = projectDataList.find((y) => y.id === id) || [];
            
    //         return `
    //         <div class="cart-item">
    //             <img src=${search.img} alt="">
    //             <div class="cart-info">
    //                 <p class="cart-info-title">${search.product}</p>
    //                 <div class="price">
    //                     <p>$ ${search.price} x ${item} = ${search.price * item}</p>
    //                 </div>
    //             </div>
    //         </div>
    //         `
    //     }).join("")
    // }
    // else {
    //     orderPriceContent.innerHTML = ``;
    //     orderContent.innerHTML = `
    //     <div class="no-item"><h4>無訂單紀錄</h4></div>
    //     `;
    // }
}
generateOrderItem();


//顯示購物車按鈕
let generateCartButton = () => {
    if (basket.length !== 0){
        document.getElementById("order-info").style.display = "block";
    }else {
        document.getElementById("order-info").style.display = "none";
    }
}
generateCartButton();


//生成購物車品項
let cartContainer = document.getElementById("cart-container");
let generateCartItem = (dom) => {
    //dom參數
    if (basket.length !== 0){
        //cart not empty
        return dom.innerHTML = basket.map((x) => {
            let {id , item} = x;//物件解構賦值變數
            
            let search = projectDataList.find((y) => y.id === id) || [];
            // console.log(search);
            return `
            <div class="cart-item">
                <img src=${search.img} alt="">
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
        dom.innerHTML = `
        <div class="no-item"><h4>購物車是空的唷</h4></div>
        `;
    }
}
generateCartItem(cartContainer);

// 開啟購物車
let displayCart = () =>{
    document.getElementById("cart-page").style.transform = "translateY(0%)";
    console.log("ok");
    document.querySelector("#order-info > div").setAttribute('onclick',"sendCart()");
    document.getElementById("order-title").innerHTML = "送出";
    document.querySelector("#order-info > div > div:nth-child(2)").style.display = "none";
}

//隱藏購物車
let hideCart = () => {
    document.getElementById("cart-page").style.transform = "translateY(120%)";
    document.querySelector("#order-info > div").setAttribute('onclick',"displayCart()");
    document.getElementById("order-title").innerHTML = "目前";
    document.querySelector("#order-info > div > div:nth-child(2)").style.display = "block";
}

//送單
let sendCart = () => {
    console.log("sendCart", basket);  
    $.ajax({
        url: "/order/" + order.id,
        method: "POST",
        data: JSON.stringify(basket),
        contentType: "application/json",
        success: (result) => {
            basket = [];
            alert('送出訂單成功！')
            clearCart();
            generateOrderItem();
        }
    })
    

    // let search = basket.find((x) => { 
    //     return hotPotType.find((y) => {
    //         return x.id === y.id
    //     })
    // })

    // if(search) {
    //     localStorage.setItem("isFirstOrder", "0");
    //     hideHotPot();
    // }

    // clearCart();
}


// console.log(document.getElementById("project01"))
//刪除品項
let removeItem = (id) => {
    let productItem = projectDataList.find(item=> item.id == id);

    //移除物件
    basket = basket.filter((x) => x.id !== productItem.id);
    // generateOrderItem();
    generateCartItem(cartContainer);
    generateCartButton();
    cartTotal();
    updata(productItem.id);
    // generateHotPotCard(shopHotPot, hotPotType);

    if (basket.length === 0) {
        hideCart();
    }
    localStorage.setItem("data", JSON.stringify(basket));
}

//購物車金額加總
let totalPrice = () => {
    let orderPrice = document.getElementById("order-price");
    if (basket.length !== 0) {
        let amount = basket.map((x) => {
            let {id, item} = x;
            let search = projectDataList.find((y) => y.id === id) || [];
            return item * search.price;
        }).reduce((x, y) => x + y ,0);

        orderPrice.innerHTML = `
        $ ${amount}
        `;
        // return amount;
    }
    else {
        orderPrice.innerHTML = `
        $ 0
        `
    }
}

totalPrice();

let clearCart = () => {
    basket = [];
    // generateOrderItem();
    generateCartItem(cartContainer);
    generateCartButton();
    cartTotal();
    totalPrice();
    resetMenu();
    // generateMenuCard(shopMeat, meatType);
    // generateMenuCard(shopSeafood, seafoodType);
    // generateMenuCard(shopVegetable, vegetableType);
    // generateMenuCard(shopDumplings, dumplingsType);
    // generateHotPotCard(shopHotPot, hotPotType);
    
    localStorage.setItem("data", JSON.stringify(basket)); 
}

//預設選取鍋物種類
let defaultChecked = () => {
    document.getElementsByClassName("hotPot-label")[0].click();  
}

// let hideHotPot = () => {
//     let isFirstOrder = localStorage.getItem("isFirstOrder");

//     if(isFirstOrder === "1") {
//         shopHotPot.style.display = "block";
//         document.getElementById("hotPot").style.display = "block";
//         defaultChecked();
//     }else {
//         shopHotPot.style.display = "none";
//         document.getElementById("hotPot").style.display = "none";
//     }
// }
// hideHotPot();

let isFirstOrder = () => {
    if(localStorage.getItem("isFirstOrder")) {
        return;
    }else {
        localStorage.setItem("isFirstOrder", "1");
        hideHotPot();
    }  
}
isFirstOrder();

//分類錨點
function scrollToAnchor(anchorName) {
    var anchor = document.getElementById(anchorName);
    var offset = anchor.offsetTop;
    document.getElementById("page-wrapper").scrollTo({
        top: offset - 5,
        behavior: "smooth",
    })
}
