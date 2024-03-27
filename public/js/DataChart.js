(function() {
    //get previous 12 months
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let data = [];
    for (let i = 0; i < 12; i++) {
        if (month === 0) {
            month = 12;
            year -= 1;
        }
        var priceItem = turnoverByYearAndMonth.find((x) => x.year === year && x.month === month);
        data.push({ month: `${year}年${month}月`, price: priceItem ? priceItem.price : 0 });
        month -= 1;
    }
    data.reverse();

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
                    borderWidth: 1
                },
                {
                    label: '月營業額',
                    data: data.map(row => row.price),
                    borderWidth: 2
                }]
            }
        }
    );
})();

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