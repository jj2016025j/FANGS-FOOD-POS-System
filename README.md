# FANGS-FOOD-POS

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
git clone https://github.com/jj2016025j/FANGS-FOOD-POS-System.git

# 執行初始化資料表
node initDB

# 安裝依賴
npm i

# 運行項目
npm start

## **使用說明**

- **網站訪問**：在瀏覽器中輸入**`http://localhost:3000`**訪問芳鍋網站。
# - **後台登入**：店內工作人員可通過**`/admin`**路徑訪問POS系統。

## **貢獻指南**

我們歡迎任何形式的貢獻，無論是功能建議、錯誤報告或是代碼提交。請先通過Issues討論您的想法或報告錯誤，然後您可以開始提交 Pull Request。

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


1.
更改環境變數
MYSQL_DATABASE為要使用的資料庫名稱
TEST_MYSQL_DATABASE為測試用資料庫名稱

初始化
使用InitDB.js會執行資料庫初始化
建立名稱為 TEST_MYSQL_DATABASE 參數內容的資料庫

3.
確保 MYSQL_DATABASE 名稱已經用 TEST_MYSQL_DATABASE 名稱建立過資料庫
資料庫就能正常使用



目前問題:
如果對同一筆訂單重複結帳伺服器會卡死 盡量避免
有時候結帳在首頁並不會刷新當前狀況
需要建立假訂單紀錄用於展示統計功能