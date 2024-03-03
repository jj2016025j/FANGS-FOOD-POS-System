const mysql = require('mysql');
const connection = mysql.createConnection({
  host: "localhost", // 資料庫伺服器地址
  user: "root", // 資料庫用戶名
  password: "", // 資料庫密碼
  // database: database // 要操作的数据库名 庫名不一定要
  charset: "utf8mb4" // 確保使用 utf8mb4
});

connection.connect(err => {
  if (err) {
    console.error('連接資料庫失敗: ' + err.stack);
    return;
  }
  console.log('資料庫連接成功，連接 ID ' + connection.threadId);
});

const dbOperations = {
  // 建立資料庫連接
  createConnection: function (host = 'localhost', user = 'root', password = '', database = null, charset = 'utf8mb4') {
    const connection = mysql.createConnection({
      host: host, // 資料庫伺服器地址
      user: user, // 資料庫用戶名
      password: password, // 資料庫密碼
      // database: database // 要操作的数据库名 庫名不一定要
      charset: charset // 確保使用 utf8mb4
    })
  },
  Connection: function () { return connection },

  // 連接到資料庫
  connectToDatabase: function () {
    connection.connect(err => {
      if (err) {
        console.error('連接資料庫失敗: ' + err.stack);
        return;
      }
      console.log('資料庫連接成功，連接 ID ' + connection.threadId);
    });
  },

  // 創建資料庫（如果不存在）
  createDatabase: function (databaseName) {
    connection.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`, (err, results) => {
      if (err) throw err;
      console.log(`${databaseName} 資料庫已創建或已存在`);
    });
  },

  // -- 轉換數據庫編碼
  alterDatabaseCharset: function (databaseName, charset = 'utf8mb4', collate = 'utf8mb4_unicode_ci') {
    connection.query(`ALTER DATABASE ${databaseName} CHARACTER SET = ${charset} COLLATE = ${collate}`, err => {
      if (err) throw err;
      console.log(`${databaseName} 資料庫編碼轉換成功`);
    });
  },

  // 選擇資料庫
  useDatabase: function (databaseName) {
    connection.query(`USE ${databaseName}`, err => {
      if (err) throw err;
      console.log(`已選擇 ${databaseName} 資料庫`);
    });
  },

  // // 創建 menu_items 表，移除與 stores 表的外鍵關聯
  // connection.query(`
  //   CREATE TABLE IF NOT EXISTS menu_items (
  //     item_id INT AUTO_INCREMENT PRIMARY KEY,
  //     name VARCHAR(255) NOT NULL,
  //     description TEXT,
  //     price DECIMAL(10, 2),
  //     category VARCHAR(100),
  //     photo_url VARCHAR(2083)
  //   ) ENGINE=InnoDB;
  // `, (err, results) => {
  //   if (err) throw err;
  //   console.log('menu_items 表創建成功或已存在');
  // });
  createTable: function () {
    queries.forEach((_query, index) => {
      connection.query(_query, function (err, results) {
        if (err) throw err;
        console.log(`Table ${index + 1} created`);

        // 當所有表都已創建完畢，關閉連接
        if (index === queries.length - 1) connection.end();
      });
    });
  },

  // 轉換表編碼
  alterTableCharset: function (tableName, charset = 'utf8mb4', collate = 'utf8mb4_unicode_ci') {
    connection.query(`ALTER TABLE ${tableName} CONVERT TO CHARACTER SET ${charset} COLLATE ${collate}`, err => {
      if (err) throw err;
      console.log(`${tableName} 表編碼轉換成功`);
    });
  },

  // // 插入資料到 menu_items
  // connection.query(
  //   `INSERT INTO menu_items (name, description, price, category, photo_url) VALUES 
  //   (?, ?, ?, ?, ?),
  //   (?, ?, ?, ?, ?),
  //   (?, ?, ?, ?, ?),
  //   (?, ?, ?, ?, ?),
  //   (?, ?, ?, ?, ?)`,
  // [
  //     '漢堡', '經典美式牛肉漢堡，配生菜、番茄、起司和特製醬料', 99.00, '主餐', 'http://example.com/burger.jpg',
  // '薯條', '酥脆金黃的薯條，外酥內軟', 30.00, '小吃', 'http://example.com/fries.jpg',
  // '可樂', '冰涼的可樂，解渴首選', 20.00, '飲料', 'http://example.com/cola.jpg',
  // '壽司盛合', '新鮮的壽司組合，包括鮭魚、吞拿魚和黃瓜卷', 180.00, '主餐', 'http://example.com/sushi.jpg',
  // '綠茶', '香醇的日式綠茶', 25.00, '飲料', 'http://example.com/greentea.jpg'
  //   ],
  //   (err, results) => {
  //     if (err) throw err;
  //     console.log('插入資料成功，插入的記錄數：', results.affectedRows);
  //   }
  // );

  // 插入資料到表
  insertIntoTable: function (tableName, columns, values) {
    let placeholders = columns.map(() => '?').join(',');
    let insertSql = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders})`;
    connection.query(insertSql, values, (err, results) => {
      if (err) throw err;
      console.log('插入資料成功，插入的記錄數：', results.affectedRows);
    });
  },

  // 查詢表中的資料
  selectFromTable: function (tableName, whereClause = '', whereValues = []) {
    let selectSql = `SELECT * FROM ${tableName}` + (whereClause ? ` WHERE ${whereClause}` : '');
    connection.query(selectSql, whereValues, (err, results) => {
      if (err) throw err;
      console.log(results);
    });
  },

  // 更新表中的資料
  updateTable: function (tableName, updateMapping, whereClause, values) {
    let setClause = Object.keys(updateMapping).map(key => `${key} = ?`).join(',');
    let updateValues = [...Object.values(updateMapping), ...values];
    let updateSql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
    connection.query(updateSql, updateValues, (err, results) => {
      if (err) throw err;
      console.log('更新資料成功，影響的行數：', results.affectedRows);
    });
  },

  // 增加列表欄
  addColumn: function (tableName, columnName, dataType) {
    let alterSql = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${dataType}`;
    connection.query(alterSql, (err, results) => {
      if (err) throw err;
      console.log('列表欄已增加');
    });
  },

  // 移除列表欄
  removeColumn: function (tableName, columnName) {
    let alterSql = `ALTER TABLE ${tableName} DROP COLUMN ${columnName}`;
    connection.query(alterSql, (err, results) => {
      if (err) throw err;
      console.log('列表欄已移除');
    });
  },

  // deleteFromTable("menu_items","name", ['漢堡'])
  // 刪除表中的資料
  deleteFromTable: function (tableName, dataName, values) {
    connection.query(`DELETE FROM ${tableName} WHERE ${dataName} = ?`, values, (err, results) => {
      if (err) throw err;
      console.log('刪除資料成功，影響的行數：', results.affectedRows);
    });
  },

  // 刪除資料表
  dropTable: function (tableName) {
    connection.query(`DROP TABLE IF EXISTS ${tableName}`, (err, results) => {
      if (err) throw err;
      console.log(`${tableName} 資料表已刪除或原本就不存在`);
    });
  },

  // 刪除資料庫
  dropDatabase: function (databaseName) {
    connection.query(`DROP DATABASE IF EXISTS ${databaseName}`, (err, results) => {
      if (err) throw err;
      console.log(`${databaseName} 資料庫已刪除或原本就不存在`);
    });
  },

  // 關閉資料庫連接
  closeConnection: function () {
    connection.end(err => {
      if (err) return console.error('關閉資料庫連接時出錯：', err);
      console.log('資料庫連接已關閉');
    });
  }
};


const queries = [
  `CREATE TABLE IF NOT EXISTS Users (
    UserId INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(255) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Email VARCHAR(255),
    Role VARCHAR(50),
    CreateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS Roles (
    Role VARCHAR(50),
    RoleId INT AUTO_INCREMENT PRIMARY KEY,
    ValidUntil TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS Pages (
    PageId INT AUTO_INCREMENT PRIMARY KEY,
    PageName VARCHAR(255) NOT NULL,
    RoleRequired VARCHAR(50) NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS Categories (
    CategoryId INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(255) NOT NULL,
    Description TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS MenuItems (
    MenuItemId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    Price DECIMAL(10, 2) NOT NULL,
    CategoryId INT,
    IsActive BOOLEAN DEFAULT TRUE,
    CreateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId)
  );`,
  `CREATE TABLE IF NOT EXISTS Orders (
    OrderId INT AUTO_INCREMENT PRIMARY KEY,
    TableId INT,
    TotalPrice DECIMAL(10, 2) NOT NULL,
    Status INT NOT NULL,
    OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UserId INT,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
  );`,
  `CREATE TABLE IF NOT EXISTS OrderItems (
    OrderItemId INT AUTO_INCREMENT PRIMARY KEY,
    MenuItemId INT,
    Quantity INT NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    CreateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    Status INT NOT NULL,
    FOREIGN KEY (MenuItemId) REFERENCES MenuItems(MenuItemId)
  );`,
  `CREATE TABLE IF NOT EXISTS OrderItemMappings (
    OrderId INT,
    OrderItemId INT,
    FOREIGN KEY (OrderId) REFERENCES Orders(OrderId),
    FOREIGN KEY (OrderItemId) REFERENCES OrderItems(OrderItemId)
  );`,
  `CREATE TABLE IF NOT EXISTS Tables (
    TableId INT AUTO_INCREMENT PRIMARY KEY,
    TableName VARCHAR(50) NOT NULL
  );`
];

module.exports = dbOperations;