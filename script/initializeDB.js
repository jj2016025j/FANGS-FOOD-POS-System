// 確認是否有資料表
// 若無則建立資料表
// 確認是否有資料庫
// 若無則建立資料庫

const mysql = require('mysql');
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "",
  charset: "utf8mb4"
});

connection.connect(err => {
  if (err) {
    console.error('連接資料庫失敗: ' + err.stack);
    return;
  }
  console.log('資料庫連接成功，連接 ID ' + connection.threadId);
});

connection.query(`USE fangs_food_pos_system`, err => {
  if (err) throw err;
  console.log(`已選擇 fangs_food_pos_system 資料庫`);
});

connection.query(`
    CREATE TABLE IF NOT EXISTS Tables (
      TableId INT AUTO_INCREMENT PRIMARY KEY,
      TableName VARCHAR(50) NOT NULL,
      Status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
    );`
  , (err) => {
    if (err) throw err
    console.log('資料表建立成功')
  })

connection.end(err => {
  if (err) return console.error('關閉資料庫連接時出錯：', err);
  console.log('資料庫連接已關閉');
});

module.exports = connection


const dbOperations = require('./mynodesql.js');

dbOperations.createDatabase('fangs_food_pos_system');
dbOperations.useDatabase('fangs_food_pos_system');
dbOperations.UseMySQL(
  `CREATE TABLE IF NOT EXISTS Categories (
    CategoryId INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(255) NOT NULL,
    Description TEXT)`
)
dbOperations.UseMySQL(
  `CREATE TABLE IF NOT EXISTS MenuItems (
    MenuItemId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    Price DECIMAL(10, 2) NOT NULL,
    CategoryId INT,
    Insupply BOOLEAN DEFAULT TRUE,
    CreateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId))`
)

const CategoryTable = {
  CategoryName: "Name",
  CategoryDescription: "CategoryDescription"
};

dbOperations.UseMySQL(
  `INSERT INTO Categories 
    (CategoryName, Description) 
    VALUES (?, ?)`,
  [CategoryTable.CategoryName,
  CategoryTable.CategoryDescription])

const Items = {
  MenuItemId: 20,
  Name: "Name",
  Description: "Description",
  Price: 0.33,
  CategoryId: 2,
  Insupply: true
};

// 
dbOperations.insertIntoMenuItems(Items)
dbOperations.updateMenuItems(Items)
// 表名稱 列名稱 列值
// dbOperations.updateFormTable("MenuItems", "MenuItemId", 1)
dbOperations.updateFromTable(
  'MenuItems', // 表名
  { // 要更新的列及其新值
    Name: "Updated Name",
    Description: "Updated Description",
    Price: 0.33,
    CategoryId: 2,
    Insupply: true
  },
  'MenuItemId', // 更新条件
  8 // 条件匹配值
);
dbOperations.deleteFromTable("MenuItems", "MenuItemId", 9)
// dbOperations.selectFromTable("MenuItemId, Name, Description, Price, CategoryId, InSupply","MenuItems")
dbOperations.closeConnection()
