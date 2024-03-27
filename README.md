1.
# 更改環境變數
開啟.env檔案
MYSQL_DATABASE為要使用的資料庫名稱
TEST_MYSQL_DATABASE為測試用資料庫名稱

2.
# 初始化
使用InitDB.js會執行資料庫初始化
建立名稱為 TEST_MYSQL_DATABASE 參數內容的資料庫
傳入所有品項
及生成歷史訂單

3.
# 執行
確保 MYSQL_DATABASE 名稱已經用 TEST_MYSQL_DATABASE 名稱建立過資料庫
輸入 npm start 即可啟動系統



目前問題:
如果對同一筆訂單重複結帳伺服器會卡死 盡量避免
有時候結帳在首頁並不會刷新當前狀況
