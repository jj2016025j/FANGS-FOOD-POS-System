//找到最近12個月
const ChartData = (function () {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let data = [];
    for (let i = 0; i < 12; i++) {
        if (month === 0) {
            month = 12;
            year -= 1;
        }
        var priceItem = timeData.find((x) => x.year === year && x.month === month);
        data.push({ month: `${year}年${month}月`, price: priceItem ? priceItem.price : 0 });
        month -= 1;
    }
    data.reverse();
    return data;
})();

/* 分類 */
let meatType = projectDataList.filter((x) => { return x.type === "meat" });
let seafoodType = projectDataList.filter((x) => { return x.type === "seafood" });
let vegetableType = projectDataList.filter((x) => { return x.type === "vegetable" });
let dumplingsType = projectDataList.filter((x) => { return x.type === "dumplings" });
// let hotpotType = projectDataList.filter((x) => {return x.type === "hotpot"});
// console.log(categoryData)

/*取得購物車資料 */
let basket = JSON.parse(localStorage.getItem("data")) || [];

//傳入購物車內容 將金額加總
let totalPrice = () => {
    let orderPrice = document.getElementById("order-price");
    if (basket.length !== 0) {
        let amount = basket.map((x) => {
            let { id, item } = x;
            let search = projectDataList.find((y) => y.id === id) || [];
            return item * search.price;
        }).reduce((x, y) => x + y, 0);

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

/*統計*/
// let getDayTurnover = () => {
//     let dayTurnover = document.getElementById("day-turnover");
//     $.get("/business", function(data) {
//         dayTurnover.innerHTML = data;
//     })
// }
// getDayTurnover();

// let getMonthTurnover = () => {
//     let monthTurnover = document.getElementById("month-turnover");
//     $.get("/business", function(data) {
//         monthTurnover.innerHTML = data;
//     })
// }
// getMonthTurnover();

// let getRank = () => {
//     let salesRankingItem = document.querySelectorAll(".sales-ranking-item");
//     let salesRankingQuantity = document.querySelectorAll(".sales-ranking-quantity");

//     $.get("/business", function(data) {
//         for (let i = 0; i < salesRankingItem.length; i++) {
//             salesRankingItem[i].innerHTML = data[i];
//             salesRankingQuantity[i].innerHTML = data[i];
//         }
//     })
// }
// getRank();


// 結帳請求
$('#all-checkout-button').on('click', () => {
    $.ajax({
        url: "/pay/checkout/",
        method: "POST",
        success: (result) => {
            alert('結帳成功')
            location.href = "/pos"
        }
    })
})

// 生成新訂單 並回傳QRCode
let generateNewOrder = (seatID) => {
    $.ajax({
        url: "/order",
        method: "POST",
        data: {
            seatID: seatID
        },
        success: function (result) {
            return result, false
        },
        error: function (error) {
            if (error.responseJSON && error.responseJSON.error) {
                // alert(error.responseJSON.error)
            }
            return {}, false
        }
    })

}
