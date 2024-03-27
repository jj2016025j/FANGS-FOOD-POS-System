// $.get("/order", function(data) {

// })
// $.get("/order/money", function(data) {

// })

$('#pay-cash-button').on('click', () => {
    $.ajax({
        url: "/pay/cash/" + order.id,
        method: "POST",
        success: (result) => {
            alert('結帳成功')
            location.href = "/pos"
        }
    })
})

$('#pay-credit-card-button').on('click', () => {
    $.ajax({
        url: "/pay/creditcard/" + order.id,
        method: "POST",
        success: (result) => {
            alert('結帳成功')
            location.href = "/pos"
        }
    })
})

$('#pay-line-pay-button').on('click', () => {
    $.ajax({
        url: "/pay/linepay/" + order.id,
        method: "POST",
        success: (result) => {
            // console.log(result.paymentUrl)
            if (result.paymentUrl) {
                // 如果服务器返回了支付URL，则跳转到该URL进行支付
                window.location.href = result.paymentUrl;
            } else {
                alert('結帳成功');
                location.href = "/pos";
            }
        },
        error: (xhr, status, error) => {
            // 处理错误情况
            alert('支付失败: ' + error);
        }
    });
});
// $.ajax({
//     url: "",
//     method: "POST",
//     data: formData,
//     processData: false,
//     contentType: false,
// })

// $.post("/menu/delete", data, function(data) {

// })

// $(function(){
//     $.get("get/menu", function(data) {
//         console.log(data)
//     })
// })

// $.get("/menulist", function(data) {

// })

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


/*編輯*/
let postNewForm = () => {
    let formData = new FormData();

    let itemName = document.getElementById("item-name").value;
    let itemPrice = document.getElementById("item-price").value;
    let selectType = document.getElementById("select-type").value;
    let itemImg = document.getElementById("item-img").files[0];

    if (itemName && itemPrice && itemImg) {
        formData.append('item-name', itemName)
        formData.append('item-price', itemPrice)
        formData.append('select-type', selectType)
        formData.append('item-img', itemImg)
    } else {
        return;
    }
    // console.log($("#item-name"))
    $.ajax({
        url: "/menu",
        method: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: () => {
            toastMessage("菜單已新增");
            setTimeout(() => {
                location.reload()
            }, 500)
        }
    })
}

let postUpdateForm = (id) => {
    let formData = new FormData()

    let itemName = document.getElementById("item-name").value;
    let itemPrice = document.getElementById("item-price").value;
    let selectType = document.getElementById("select-type").value;
    let itemImg = document.getElementById("item-img").files[0];

    if (itemName && itemPrice) {
        formData.append('item-name', itemName)
        formData.append('item-price', itemPrice)
        formData.append('select-type', selectType)
        if (itemImg) formData.append('item-img', itemImg)
    } else {
        return;
    }
    $.ajax({
        url: "/menu/" + id,
        method: "PUT",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            toastMessage("菜單已更新");
            setTimeout(() => {
                location.reload()
            }, 1000)
        }

    })

}

let deleteItem = (itemId) => {
    $.ajax({
        url: "/menu/" + itemId,
        method: "DELETE",
        processData: false,
        contentType: false,
        success: (result) => {
            closeDeleteConfirm();
            toastMessage(`菜單刪除成功`);
            setTimeout(() => {
                location.reload()
            }, 500)
        }
    })

    // //post itemId
    // $.post("/menu/delete", itemName, function(data) {
    //         console.log(data);
    // })
}


/* 點餐*/
// 刪除選項
let deleteOrder = (food_id) => {
    if (confirm('確定刪除？')) {

        $.ajax({
            url: "/order/foods/" + order.id + "/" + food_id,
            method: "DELETE",
            data: {},
            contentType: "application/json",
            success: () => {
                alert('刪除成功')
                generateOrderItem();
            },
            error: () => {
                alert('發生錯誤')
            }
        })

    }
}

// 送出訂單
let sendOrder = () => {
    $.ajax({
        url: "/order/" + order.id,
        method: "POST",
        data: JSON.stringify(basket),
        contentType: "application/json",
        success: () => {
            return true
        }
    })
}

//取得訂單品項
let getOrderItem = () => {
    $.ajax({
        url: "/order/list/" + order.id,
        method: "GET",
        data: {},
        contentType: "application/json",
        success: (foods) => {
            return foods, true
        },
        error: () => {
            return {}, false
        }
    })
}

// let getMenu = () => {
//     $.get("/menulist", function(data) {
//         projectDataList = data;
//     })
// };
// getMenu();