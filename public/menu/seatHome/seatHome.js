let seatArray = JSON.parse(localStorage.getItem("seatIsON")) || [];
//座位陣列

const seatContainer = document.getElementById("seat-container");

//生成座位表
let generateSeat = () => {
    return seatContainer.innerHTML = seatList.map((x) => {
        let {seatNum} = x;
        let search = seatArray.find(y => y.seatNum == seatNum);
        // console.log(search)
        return `
            <div class="seat-layout">
                <div class="seat" id=${seatNum}>
                    <div class="seat-number">${seatNum}</div>
                    <div class="seat-state">${search ? "<span style='color: red;'>用餐中</span>" : "<span style='color: green;'>空桌</span>"}</div>
                </div>
                <div class="seat-option-content">
                    <a data-seatnum=${seatNum} class="seat-order-btn" href="../seatOrder/seatOrder.html">點餐/結帳</a>
                    <a data-seatnum=${seatNum} class="seat-qrcode-btn">生成QR code</a>
                </div>
            </div>
        `
    }).join("")
}
generateSeat()

//開啟座位選單
let displaySeatOption = () => {
    let seat = document.getElementsByClassName("seat");

    //桌號選項顯示
    for(let i = 0; i < seat.length; i++) {
        seat[i].addEventListener("click", function(e) {
            e.stopPropagation();
            // console.log("seat")
            let seatOptionContent = document.getElementsByClassName("seat-option-content");
            for (let j = 0; j < seatOptionContent.length; j++) {
                seatOptionContent[j].style.display = "none"
            }
            this.nextElementSibling.style.display = "block";
        })
    }
}
displaySeatOption();

//點空白處關閉選單
let closeSeatOption = () => {
    seatContainer.addEventListener("click", function(e) {
        console.log("seatContainer")
        let seatOptionContent = document.getElementsByClassName("seat-option-content");
        for (let j = 0; j < seatOptionContent.length; j++) {
            seatOptionContent[j].style.display = "none"
        }
    })
}
closeSeatOption();
    

//生成QRcode按鈕並且更改用桌狀態
let generateQRcode = (e) => {
    let qrcodeBtnList = document.getElementsByClassName("seat-qrcode-btn");
    for (let k = 0; k < qrcodeBtnList.length; k++) {
        qrcodeBtnList[k].addEventListener("click", function(e) {
            e.stopPropagation();
            //要傳給後端的桌號
            // let seatID = this.parentNode.previousElementSibling.getElementsByClassName("seat-number")[0].innerHTML;
            let seatID = e.target.getAttribute('data-seatnum');
            // console.log(seatID);
            let search = seatArray.find(x => x.seatNum == seatID);
            if(search  === undefined) {
                seatArray.push({
                    seatNum: seatID,
                    qrCode: "",
                });
            }else {
                return
            }
            updataState();
            localStorage.setItem("seatIsON", JSON.stringify(seatArray));
        })
    }
}      
generateQRcode();
    
//桌號點餐按鈕(session)
let goToOrderButton = () => {
    let seatOrderList = document.getElementsByClassName("seat-order-btn");
    for (let j = 0; j < seatOrderList.length; j++) {
        seatOrderList[j].addEventListener("click", function(e) {
            e.stopPropagation();
            let seatID = e.target.getAttribute('data-seatnum');
            localStorage.setItem("seatNum", seatID);
        })
    }
}
goToOrderButton();

let updataState = () => {
    generateSeat();
    generateQRcode();
    goToOrderButton();
    displaySeatOption();
}
