const pool = require("../mynodesql.js")
var fs = require('fs');

// 連接資料庫
pool.Connection()

// 如果要重建資料庫就保留這個功能 重建後再備註
// pool.dropDatabase("fang_project2")

pool.createDatabase("fang_project2")
pool.useDatabase("fang_project2")

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

const categoryMap = {
  "hotpot": 1,
  "meat": 2,
  "seafood": 3,
  "vegetable": 4,
  "dumplings": 5
};

// 分類
pool.UseMySQL(
  `CREATE TABLE IF NOT EXISTS foods_category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    sort INT DEFAULT 0)`
)

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
pool.insertProjectDataList(itemData, categoryMap)

var sample_foods = require('../data/fangsFoodData.js');

const Items = {
  MenuItemId: 20,
  Name: "Name",
  Description: "Description",
  Price: 0.33,
  CategoryId: 2,
  Insupply: true
};

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

// pool.dropDatabase("fang_project2")

pool.closeConnection()

module.exports = pool
