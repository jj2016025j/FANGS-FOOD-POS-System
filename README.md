# FANGS-FOOD-POS

# 芳鍋火鍋網站及POS系統

芳鍋是一家結合傳統火鍋文化與現代科技的餐飲品牌，提供顧客線上點餐、預約訂位與即時客服的全新餐飲體驗。本項目包含芳鍋的官方網站和後台POS系統，旨在提升顧客體驗和店內運營效率。

## 功能特點

- **線上點餐**：顧客可通過網站瀏覽菜單，選擇心儀的餐點並在線支付。
- **POS系統**：為店內工作人員提供強大的點餐、結帳和訂單管理功能。

## 技術棧

- 前端：React, Bootstrap, SCSS
- 後端：Node.js, Express
- 數據庫：MySQL
- 第三方服務：Stripe支付集成, SendGrid郵件服務

## 安裝指南

# 克隆項目
```bash
git clone https://github.com/jj2016025j/FANGS-FOOD-POS-System.git
```

# 建立.env檔案 並貼上以下內容
```bash
MYSQL_HOST = 'localhost'
MYSQL_USER = 'root'
MYSQL_PASSWORD = ''
MYSQL_DATABASE = 'fang_pos_system'
TEST_MYSQL_DATABASE = 'fang_pos_system'
```

# 安裝依賴
npm i

# 執行初始化資料表
node initDB

# 運行項目
npm start


# 錯誤修正

因為打印機操作庫有版本問題
會發生以下錯誤
TypeError: usb.on is not a function
at new USB (C:\Users\樺\GitHub\FANGS-FOOD-POS-System\node_modules\escpos-usb\index.js:52:7)

需要把腳本裡面的以下程式碼刪除
// usb.on('detach', function(device){
//   if(device == self.device) {
//     self.emit('detach'    , device);
//     self.emit('disconnect', device);
//     self.device = null;
//   }
// });



## **使用說明**

- **網站訪問**：在瀏覽器中輸入**`http://localhost:3000`**訪問芳鍋網站。
# - **後台登入**：店內工作人員可通過**`/admin`**路徑訪問POS系統。

## **貢獻指南**

我們歡迎任何形式的貢獻，無論是功能建議、錯誤報告或是代碼提交。請先通過Issues討論您的想法或報告錯誤，然後您可以開始提交 Pull Request。

請從 feature 分支開發
並對 feature 分支發送pull request

管理者會確認 feature 分支執行有無問題
無問題會 merge 至 main 分支

## **授權信息**

本項目採用 MIT授權。

## **聯絡方式**

如有任何問題或建議，請通過以下方式聯絡我們：

- 郵件：jj2016025j@gmail.com
- 電話：0971-003-199
