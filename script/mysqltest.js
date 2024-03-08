// const express = require('express');
const mysql = require('mysql');
// const bodyParser = require('body-parser');

// const app = express();
// const port = 3000;

// app.use(bodyParser.json());

// 設定MySQL連接
const connection = mysql.createConnection({
  host: 'your-database-host',
  user: 'your-database-user',
  password: 'your-database-password',
  database: 'your-database-name'
});

// 連接到數據庫
connection.connect(error => {
  if (error) throw error;
  console.log('Successfully connected to the database.');

});
const sql = `CREATE TABLE IF NOT EXISTS MenuItems (
    MenuItemId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    Price DECIMAL(10, 2) NOT NULL,
    CategoryId INT,
    Insupply BOOLEAN DEFAULT TRUE,
    CreateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId)
  )`;
  try {
    const results = connection.query(sql);
    res.json(results);
  } catch (error) {
      // 加入如果錯誤就新增資料表或是資料庫
    res.status(500).send('新增菜單資料表失敗');
  }