const pool = require("../mynodesql.js")
var fs = require('fs');

// 連接資料庫
pool.Connection()

// 如果要重建資料庫就保留這個功能 重建後再備註
pool.dropDatabase("test")

// pool.createDatabase("fangs_food_pos_system")
// pool.useDatabase("fangs_food_pos_system")
pool.createDatabase("test")
pool.useDatabase("test")

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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
)

pool.UseMySQL(
  `ALTER TABLE users MODIFY id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=0;`
)

pool.UseMySQL(`
  CREATE TABLE IF NOT EXISTS Tables (
  TableId INT AUTO_INCREMENT PRIMARY KEY,
  TableName VARCHAR(50) NOT NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
  );`
)

// 假設我們要插入5個桌號
// pool.insertTables(5);

pool.UseMySQL(
  `CREATE TABLE IF NOT EXISTS Categories (
    CategoryId INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(255) NOT NULL,
    Description TEXT)`
)

const CategoryTable = {
  CategoryName: "Name",
  CategoryDescription: "CategoryDescription"
};

pool.UseMySQL(
  `INSERT INTO Categories
    (CategoryName, Description)
    VALUES (?, ?)`,
  [CategoryTable.CategoryName,
  CategoryTable.CategoryDescription])


// 分類
pool.UseMySQL(
  `CREATE TABLE IF NOT EXISTS foods_category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    sort INT DEFAULT 0)`
)

const categoryMap = {
  "hotpot": 1,
  "meat": 2,
  "seafood": 3,
  "vegetable": 4,
  "dumplings": 5
};

// 傳入分類
pool.UseMySQL(
  `INSERT INTO foods_category (category, sort) VALUES 
  ('鍋類', 1), 
  ('肉類', 2), 
  ('海鮮類', 3), 
  ('蔬菜類', 4), 
  ('火鍋餃類', 5)`
);

// 食物
pool.UseMySQL(
  `CREATE TABLE IF NOT EXISTS foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    price INT NOT NULL,
    image_url TEXT NULL,
    deleted_at TIMESTAMP NULL,
  sort INT DEFAULT 0)`
)

const itemData = require("../data/fangsFoodData.js")
// pool.insertProjectDataList(itemData, categoryMap)

pool.UseMySQL(
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
console.log("MenuItems")

const Items = {
  MenuItemId: 20,
  Name: "Name",
  Description: "Description",
  Price: 0.33,
  CategoryId: 2,
  Insupply: true
};

// pool.insertIntoMenuItems(Items)
pool.updateMenuItems(Items)

// 表名稱 列名稱 列值
pool.updateFromTable(
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

pool.deleteFromTable("MenuItems", "MenuItemId", 9)
pool.selectFromTable("MenuItemId, Name, Description, Price, CategoryId, InSupply", "MenuItems")

// 訂單
pool.UseMySQL(
  `CREATE TABLE IF NOT EXISTS table_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trade_no VARCHAR(255) NOT NULL,
  food_price INT NULL,
  service_fee INT NULL,
  trade_amt INT NULL,
  table_number INT NOT NULL,
  order_status TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_at TIMESTAMP NULL)`
)

// 訂單品項對照表
pool.UseMySQL(
  ` CREATE TABLE IF NOT EXISTS orders_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price INT NOT NULL,
    total_price INT NOT NULL)`
)

// LOG
pool.UseMySQL(
  `CREATE TABLE IF NOT EXISTS action_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    Description TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`
)


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

// pool.UseMySQL(
//   `CREATE TABLE IF NOT EXISTS Orders (
//     OrderId INT AUTO_INCREMENT PRIMARY KEY,
//     TableId INT,
//     TotalPrice DECIMAL(10, 2) NOT NULL,
//     Status INT NOT NULL,
//     OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     UpdateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     UserId INT,
//   );`)

// pool.UseMySQL(
//   `CREATE TABLE IF NOT EXISTS OrderItemMappings (
//     OrderId INT,
//     OrderItemId INT,
//     FOREIGN KEY (OrderId) REFERENCES Orders(OrderId),
//     FOREIGN KEY (OrderItemId) REFERENCES OrderItems(OrderItemId)
//   );`)

// pool.dropDatabase("test")

pool.closeConnection()

module.exports = pool
