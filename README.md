# FANGS-FOOD-POS
test

# 芳鍋火鍋網站及POS系統

芳鍋是一家結合傳統火鍋文化與現代科技的餐飲品牌，提供顧客線上點餐、預約訂位與即時客服的全新餐飲體驗。本項目包含芳鍋的官方網站和後台POS系統，旨在提升顧客體驗和店內運營效率。

## 功能特點

- **線上點餐**：顧客可通過網站瀏覽菜單，選擇心儀的餐點並在線支付。
- **預約訂位**：提供線上預約訂位服務，顧客可選擇心儀的時間和座位進行預訂。
- **即時客服**：整合即時通訊功能，顧客可通過網站直接與客服溝通。
- **POS系統**：為店內工作人員提供強大的點餐、結帳和訂單管理功能。

## 技術棧

- 前端：React, Bootstrap, SCSS
- 後端：Node.js, Express
- 數據庫：MySQL
- 第三方服務：Stripe支付集成, SendGrid郵件服務

## 安裝指南

```bash
# 克隆項目
git clone https://github.com/yourusername/fangguo.git

# 進入項目目錄
cd fangguo

# 安裝依賴
npm install

# 運行項目
npm start

## **使用說明**

- **網站訪問**：在瀏覽器中輸入**`http://localhost:3000`**訪問芳鍋網站。
- **後台登入**：店內工作人員可通過**`/admin`**路徑訪問POS系統。

## **貢獻指南**

我們歡迎任何形式的貢獻，無論是功能建議、錯誤報告或是代碼提交。請先通過Issues討論您的想法或報告錯誤，然後您可以開始提交Pull Request。

## **授權信息**

本項目採用 MIT授權。

## **聯絡方式**

如有任何問題或建議，請通過以下方式聯絡我們：

- 郵件：support@fangguo.com
- 電話：123-456-7890

```
Copy code

請根據您的項目需求調整上述模板的內容。記得替換連結、郵件地址和其他特定信息，以反映您的實際項目情況。

```
1. 本機mysql 新增database  fang_project
2. .env 輸入password
3. 開啟終端機輸入
node migrate.js
//4. 輸入
cd ./seeder
//5. 輸入
node food_seeders.js
//6. 輸入
cd ..
//7. 輸入
node index.js
8. 網址 http://localhost:3000/shop

會發生以下錯誤
TypeError: usb.on is not a function
at new USB (C:\Users\樺\GitHub\FANGS-FOOD-POS-System\node_modules\escpos-usb\index.js:52:7)
要把腳本裡面的以下程式碼刪除
// usb.on('detach', function(device){
//   if(device == self.device) {
//     self.emit('detach'    , device);
//     self.emit('disconnect', device);
//     self.device = null;
//   }
// });