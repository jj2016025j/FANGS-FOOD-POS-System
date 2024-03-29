const pool = require("./mynodesql.js")
var fs = require('fs');
require('dotenv').config();

const TEST_MYSQL_DATABASE = process.env.TEST_MYSQL_DATABASE;

// 如果要重建資料庫就保留這個功能 重建後再備註
pool.dropDatabase(TEST_MYSQL_DATABASE)

pool.createDatabase(TEST_MYSQL_DATABASE)
pool.useDatabase(TEST_MYSQL_DATABASE)

// 分類
pool.UseMySQL(
  `CREATE TABLE IF NOT EXISTS Category (
    CategoryId INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(255) NOT NULL,
    Description TEXT NULL,
    sort INT DEFAULT 0)`
  , "", "建立 分類 資料表")

// 傳入分類
pool.UseMySQL(
  `INSERT INTO Category (CategoryName, sort) VALUES 
  ('鍋類', 1), 
  ('肉類', 2), 
  ('海鮮類', 3), 
  ('蔬菜類', 4), 
  ('火鍋餃類', 5)`
  , "", "傳入 分類 資料")

const categoryMap = {
  "hotpot": 1,
  "meat": 2,
  "seafood": 3,
  "vegetable": 4,
  "dumplings": 5
};

pool.UseMySQL(`
CREATE TABLE IF NOT EXISTS Tables (
  TableId INT AUTO_INCREMENT PRIMARY KEY,
  TableNumber INT NOT NULL,
  Status ENUM('空桌', '點餐中', '待確認', '製作中', '用餐中', '清潔中') NOT NULL DEFAULT '空桌',
  MainOrderId VARCHAR(255) NULL
);
`, "", "建立 桌位 資料表")

function initTable(number) {
  for (i = 1; i <= number; i++) {
    pool.UseMySQL(`
      INSERT INTO Tables (TableNumber) 
      VALUES (?)`,
      [i],
      `加入 桌號${i}`)
  }
}
initTable(20)

// 食物
pool.UseMySQL(
  `CREATE TABLE IF NOT EXISTS MenuItems (
    MenuItemId INT AUTO_INCREMENT PRIMARY KEY,
    MenuItemName VARCHAR(255) NOT NULL,
    CategoryId INT NOT NULL,
    Price INT NOT NULL,
    image_url TEXT NULL,
    Insupply BOOLEAN DEFAULT TRUE,
    CreateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoryId) REFERENCES Category(CategoryId) ON DELETE CASCADE,
    sort INT DEFAULT 0
  );
  `
  , "", "建立 MenuItems 資料表")

const itemData = require("./script/data/fangsFoodData.js")
pool.insertMenuItemsData(itemData, categoryMap)

// 訂單
pool.UseMySQL(
  `CREATE TABLE IF NOT EXISTS MainOrders (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  MainOrderId VARCHAR(255) NOT NULL,
  SubTotal INT DEFAULT 0,
  ServiceFee INT DEFAULT 0,
  Total INT DEFAULT 0,
  TableId INT NOT NULL,
  OrderStatus ENUM('未結帳', '以結帳') NOT NULL DEFAULT '未結帳',
  createdTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdateTime TIMESTAMP NULL,
  UserId INT,
  FOREIGN KEY (TableId) REFERENCES Tables(TableId)
  )`
  , "", "建立 MainOrders 資料表")

const MainOrderId = 'ORD' + new Date().getTime() + Math.random().toString(36).substring(2, 15);
function makeNewMainOrder(MainOrderId) {
  const TableId = Math.floor(Math.random() * 12) + 1;//隨機生成1~12
  pool.UseMySQL(`
    INSERT INTO MainOrders (MainOrderId, TableId) 
    VALUES (?, ?)`, [MainOrderId, TableId],
    `加入新的 主訂單${MainOrderId}`)
}
makeNewMainOrder(MainOrderId)
console.log(MainOrderId)

// 生成ID 丟入資料表
// 如果ID重複則重新建立ID再丟入
// 如果沒重複則返回已完成

// const generateFunction = require("./generateOrders.js")
// let i = 1;
// generateFunction.generateOrders.forEach(order => {
//   pool.UseMySQL(
//     `INSERT INTO table_orders (trade_no, food_price, service_fee, trade_amt, table_number, order_status, created_at, payment_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//     [order.trade_no, order.food_price, order.service_fee, order.trade_amt, order.table_number, order.order_status, order.created_at, order.payment_at],
//     `插入第${i}筆訂單 ${order.trade_no}到 orders 表`
//   );
//   i++
// });

pool.UseMySQL(
  `CREATE TABLE IF NOT EXISTS OrderMenuItemsMappings (
    MainOrderId VARCHAR(255) NOT NULL,
    MenuItemId INT NOT NULL,
    quantity INT NOT NULL,
    unit_price INT NOT NULL,
    total_price INT NOT NULL,
    -- FOREIGN KEY (MainOrderId) REFERENCES MainOrders(MainOrderId) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MenuItemId) REFERENCES MenuItems(MenuItemId) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (MainOrderId, MenuItemId)
  );
`, "", "建立 主訂單與品項 對照資料表")

// 子訂單
pool.UseMySQL(
  `CREATE TABLE IF NOT EXISTS SubOrders (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  SubOrderId VARCHAR(255) NOT NULL,
  MainOrderId VARCHAR(255) NOT NULL,
  SubTotal INT DEFAULT 0,
  TableId INT NOT NULL,
  OrderStatus ENUM('未製作', '製作中', '已完成') NOT NULL DEFAULT '未製作',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
  -- ,
  -- FOREIGN KEY (MainOrderId) REFERENCES MainOrders(MainOrderId) ON DELETE CASCADE`
  , "", "建立 子訂單 資料表")
const SubOrderId = MainOrderId + 'SUB' + Math.floor(Math.random() * 10000) + 1;

function makeNewSubOrder(MainOrderId) {
  const TableId = Math.floor(Math.random() * 12) + 1;//隨機生成1~12
  pool.UseMySQL(`
  INSERT INTO SubOrders (SubOrderId, MainOrderId, TableId) 
  VALUES (?, ?, ?)`, [SubOrderId, MainOrderId, TableId],
    `加入新的 子訂單${SubOrderId}`)
}
makeNewSubOrder(MainOrderId, SubOrderId)
// 傳入主訂單ID 訂單內容
// 子訂單ID=主訂單ID+(已有子訂單數量+1)
// 組成子訂單資料及訂單內容對照表

pool.UseMySQL(
  `CREATE TABLE IF NOT EXISTS SubOrderMenuItemsMappings (
  SubOrderId VARCHAR(255) NOT NULL,
  MenuItemId INT NOT NULL,
  quantity INT NOT NULL,
  total_price INT NOT NULL,
  -- FOREIGN KEY (SubOrderId) REFERENCES SubOrders(SubOrderId) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (MenuItemId) REFERENCES MenuItems(MenuItemId) ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY (SubOrderId, MenuItemId)
);
`, "", "建立 子訂單與品項 對照資料表")

const SubOrderInfo = [
  {
    "MenuItemId": 1,
    "quantity": 1,
    "total_price": 100
  },
  {
    "MenuItemId": 2,
    "quantity": 1,
    "total_price": 100
  }
]
function makeNewSubOrderMenuItemsMappings(SubOrderId, SubOrderInfo) {
  console.log(SubOrderId)
  SubOrderInfo.forEach(item => {
    pool.UseMySQL(`
      INSERT INTO SubOrderMenuItemsMappings (SubOrderId, MenuItemId, quantity, total_price) 
      VALUES (?, ?, ?, ?)`,
      [SubOrderId, item.MenuItemId, item.quantity, item.total_price],
      `加入 子訂單 ${SubOrderId} 與品項 ${item.MenuItemId} 對照表`)
  })
  // 取得與此子訂單的主訂單的所有品項 與主訂單內容加總 並更改主訂單內容對照表
}
makeNewSubOrderMenuItemsMappings(SubOrderId, SubOrderInfo)

// // LOG
// pool.UseMySQL(
//   `CREATE TABLE IF NOT EXISTS action_log (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     name VARCHAR(255) NOT NULL UNIQUE,
//     Description TEXT,
//     executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`
// )


// pool.UseMySQL(
//   `CREATE TABLE IF NOT EXISTS Roles (
//     Role VARCHAR(50),
//     RoleId INT AUTO_INCREMENT PRIMARY KEY,
//     ValidUntil TIMESTAMP
//   );`)

// pool.UseMySQL(
//   `CREATE TABLE IF NOT EXISTS Pages (
//     PageId INT AUTO_INCREMENT PRIMARY KEY,
//     PageName VARCHAR(255) NOT NULL,
//     RoleRequired VARCHAR(50) NOT NULL
//   );`)

pool.UseMySQL(
  `CREATE TABLE IF NOT EXISTS users (
    id int(11) NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    googleID varchar(255) DEFAULT NULL,
    date datetime DEFAULT current_timestamp(),
    thumbnail varchar(255) DEFAULT 'https://img.league-funny.com/imgur/148292128067.jpg',
    email varchar(255) DEFAULT NULL,
    password varchar(1024) DEFAULT NULL,
    lineID varchar(255) DEFAULT NULL,
    reset_token varchar(255) DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY email_unique (email)
  ) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `, "", "建立 三方登入用 資料表")

// pool.dropDatabase("test")

pool.closeConnection()

module.exports = pool
