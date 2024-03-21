$(function(){
    $.get("get/menu", function(data) {
        console.log(data)
    })
})

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

// 生成品項
let generateMenuCard = (dom, datalist) => {
    return dom.innerHTML = datalist.map((x) => {//slice選取projectDataList內部分物件
        let {img, product, price, id} = x;
        //從本機儲存裡找資料
        return `
            <div class="col-md-6" id=${id}>
                <div class="item">
                        <div class="mycard">
                            <img class="menu-img" src=${img} alt="project-pic"/>
                            <div class="mycard-body">
                                <div class="body-info">
                                    <h4 class="card-title">${product}</h4>
                                    <p class="card-text">$${price}</p>
                                </div>
                                <div class="card-btn-group">
                                    <i  onclick="editItem(${id})" class="bi bi-pencil"></i>
                                    <i  onclick="deleteConfirm(${id})" class="bi bi-trash"></i>
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

//側欄表單開始
let customSelect = document.getElementsByClassName("custom-select");
        
for(let i = 0; i < customSelect.length; i++) {
    let selItem = customSelect[i].getElementsByTagName("select")[0]//5 option
    // console.log(selItem.length) //5
    
    let selectedItem = document.createElement("div");
    selectedItem.setAttribute("class", "select-selected");
    selectedItem.innerHTML = selItem.options[selItem.selectedIndex].innerHTML;
    customSelect[i].appendChild(selectedItem); //創建當前選擇選項div

    let selectItems = document.createElement("div");
    selectItems.setAttribute("class", "select-items select-hide");//創建裝option的<div class="select-items"></div>
    
    //創建每個option
    for(let j = 0; j < selItem.length; j++) { //j = 1 排除第一個選項
        let optItem = document.createElement("div");
        optItem.innerHTML = selItem.options[j].innerHTML;

        //點擊時更新原本的select box並且選取option
        optItem.addEventListener("click", function(e) {
            let originSelect = this.parentNode.parentNode.getElementsByTagName("select")[0];//<select>
            let selectedDiv = this.parentNode.previousSibling; //<div class="select-selected"></div>

            for(let i = 0; i < originSelect.length; i++) {
                if(originSelect.options[i].innerHTML == this.innerHTML) {
                    originSelect.selectedIndex = i;
                    selectedDiv.innerHTML = this.innerHTML;
                    let sameAsSelected = this.parentNode.getElementsByClassName("same-as-selected");

                    for(let k = 0; k < sameAsSelected.length; k++) {
                        sameAsSelected[k].removeAttribute("class");
                    }
                    this.setAttribute("class", "same-as-selected")
                    break;
                }
            }
            selectedDiv.click();
        })
        selectItems.appendChild(optItem);//<div class="select-items">optItem</div>
    }
    
    customSelect[i].appendChild(selectItems);//<div class="custom-select">selectItems</div>
    //
    selectedItem.addEventListener("click", function(e) {
        this.nextSibling.classList.toggle("select-hide");//nextSibling 此元素的下一個兄弟姊妹
        this.classList.toggle("select-arrow-active")
    })
    //預設select顯示(程式控制 selected選項)
    // console.log(selItem.selectedIndex)
    document.getElementsByClassName("select-items")[0].getElementsByTagName("div")[selItem.selectedIndex].setAttribute("class", "same-as-selected");
}



//檔案上傳顯示檔名及縮圖
document.getElementById("item-img").addEventListener("change", function(e) {
    generateFileImg(e.target.files[0]);
})

let generateFileImg = (file) => {
    //生成縮圖及檔名
    if(file) {
        document.getElementById("file-name").innerHTML = file.name;
        document.getElementById("file-img").src = URL.createObjectURL(file);
    }else {
        document.getElementById("file-name").innerHTML = "未選擇任何檔案";
        document.getElementById("file-img").src = "";
    }
}

//取消瀏覽器自己發送表單
document.getElementById("form-option").addEventListener("submit", function(e) {
    e.preventDefault();
})



// 新增按鈕及修改按鈕功能
document.querySelector(".plus-icon").addEventListener("click", function() {
    editItem();
    closeDeleteConfirm()
    document.querySelector(".form-page").style.transform = "translateX(0%)";
})

document.getElementById("form-cancel-btn").addEventListener("click", function(e) {
    document.querySelector(".form-page").style.transform = "translateX(100%)";
    generateFileImg();
})


let editItem = (itemId) => {
    if(itemId) {
        document.querySelector(".form-title").innerHTML = "修改";
        let search = projectDataList.find((x) => x.id === itemId.id) || [];
        let {id, price, product, type} = search;
        
        document.getElementById("item-name").value = product;
        document.getElementById("item-price").value = price;
        
        let selectType = document.getElementById("select-type");
        let optList = [...document.getElementById("select-type").options];

        let list = optList.map((x) => {
            return x.value
        })

        let currentIndex =  list.indexOf(type);

        let selectSelected = document.querySelector(".select-selected")
        let selectItems = document.querySelector(".select-items")

        selectSelected.click();
        selectItems.getElementsByTagName("div")[currentIndex].click();
        document.getElementById("form-submit-btn").setAttribute("onclick", "postUpdateForm()");
    }else {
        document.querySelector(".form-title").innerHTML = "新增";
        document.getElementById("form-submit-btn").setAttribute("onclick", "postNewForm()");
    }
    document.querySelector(".form-page").style.transform = "translateX(0%)";
    closeDeleteConfirm();
}

let postUpdateForm = () => {
    let formData = new FormData()
    
    let itemName = document.getElementById("item-name").value;
    let itemPrice = document.getElementById("item-price").value;
    let selectType = document.getElementById("select-type").value;
    let itemImg = document.getElementById("item-img").files[0];
    
    if (itemName && itemPrice && itemImg) {
        formData.append('item-name', itemName)
        formData.append('item-price', itemPrice)
        formData.append('select-type', selectType)
        formData.append('item-img', itemImg)
    }else {
        return;
    }
    $.ajax({
        url: "/menu/update",
        method: "POST",
        data: formData,
        processData: false,
        contentType: false,
    })
    toastMessage("菜單已更新");
}

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
    }else {
        return;
    }
    console.log($("#item-name"))
    $.ajax({
        url: "/menu/new",
        method: "POST",
        data: formData,
        processData: false,
        contentType: false,
    })
    toastMessage("菜單已新增");
    console.log("New")
}

let deleteItem = (itemId) => {
    //post itemId
    let itemName = itemId.getElementsByClassName("card-title")[0].innerHTML;
    $.post("/menu/delete", itemName, function(data) {
            console.log(data);
    })
    toastMessage(`菜單已刪除${itemName}`);
    console.log("deleteItem")
    closeDeleteConfirm();
}

// 提示訊息 msg:顯示訊息
let toastMessage = (msg) => {
    let message = document.getElementById("message");
    message.innerHTML = `${msg}<i class="bi bi-check-circle-fill"></i>`
    message.classList.add("show");
    setTimeout(() => {message.classList.remove("show")}, 1500);
}

//刪除確認框
let deleteConfirm = (id) => {
    let deleteConfirm = document.getElementById("delete-confirm");
    let deleteBtn = document.getElementById("delete-btn");
    deleteConfirm.style.display = "block";
    deleteBtn.setAttribute("onclick", `deleteItem(${id.id})`);
}

let closeDeleteConfirm = () => {
    let deleteConfirm = document.getElementById("delete-confirm");
    deleteConfirm.style.display = "none";
}
