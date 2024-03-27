const mysql = require('mysql');
require('dotenv').config();

const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;
console.log(MYSQL_HOST)
console.log(MYSQL_USER)
console.log(MYSQL_PASSWORD)

// const {
//   MYSQL_HOST,
//   MYSQL_USER,
//   MYSQL_PASSWORD,
//   MYSQL_DATABASE
// } = process.env;
// console.log(process.env)

const local = mysql.createConnection({
  connectionLimit: 20, // 連接池大小
  host: MYSQL_HOST, // 資料庫伺服器地址
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  // database: MYSQL_DATABASE
  charset: "utf8mb4",
  port: 3306
});

// 給雲端用的
const aws = mysql.createConnection({
  host: 'fangfoodbackend-v3-instance-1.cd08s4082uws.ap-northeast-1.rds.amazonaws.com', // RDS终端节点
  user: "admin",
  password: "",
  charset: "utf8mb4",
  port: 3306
});

const connection = local

const dbOperations = {
  // 建立資料庫連接
  // dbOperations.createConnection('localhost', 'root', '', '', 'utf8mb4')
  createConnection: function (host = 'localhost', user = 'root', password = '', database = "", charset = 'utf8mb4') {
    const connection = mysql.createConnection({
      host: host,
      user: user,
      password: password,
      database: database,
      charset: charset
    })
    return connection
  },

  // 直接返回SQL物件
  // dbOperations.Connection()
  Connection: function () {
    console.log("取得連線物件")
    return connection
  },

  // 建立連接
  // dbOperations.connectToSQL()
  connectToSQL: function () {
    connection.connect(err => {
      if (err) {
        console.error('連接資料庫失敗: ' + err.stack);
        return;
      }
      console.log('資料庫連接成功，連接 ID ' + connection.threadId);
    });
  },

  // 創建資料庫（如果不存在）
  // dbOperations.createDatabase("databaseName")
  createDatabase: function (databaseName) {
    connection.query(`CREATE DATABASE IF NOT EXISTS ${databaseName} CHARACTER SET utf8 COLLATE utf8_general_ci;`, (err) => {
      if (err) throw err;
      console.log(`${databaseName} 資料庫已創建或已存在`);
    });
  },
  //CREATE DATABASE restaurant_order CHARACTER SET utf8 COLLATE utf8_general_ci;

  // 轉換數據庫編碼
  // dbOperations.alterDatabaseCharset("databaseName", "utf8mb4", "utf8mb4_unicode_ci")
  alterDatabaseCharset: function (databaseName, charset = 'utf8mb4', collate = 'utf8mb4_unicode_ci') {
    connection.query(`ALTER DATABASE ${databaseName} CHARACTER SET = ${charset} COLLATE = ${collate}`, err => {
      if (err) throw err;
      console.log(`${databaseName} 資料庫編碼轉換成功`);
    });
  },

  // 選擇資料庫
  // dbOperations.useDatabase("databaseName")
  useDatabase: function (databaseName) {
    connection.query(`USE ${databaseName}`, err => {
      if (err) throw err;
      console.log(`已選擇 ${databaseName} 資料庫`);
    });
  },


  // 一次創建很多個表
  // dbOperations.createTables(sql[])
  createTables: function (queries) {
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
  // dbOperations.alterTableCharset("databaseName")
  alterTableCharset: function (tableName, charset = 'utf8mb4', collate = 'utf8mb4_unicode_ci') {
    connection.query(`ALTER TABLE ${tableName} CONVERT TO CHARACTER SET ${charset} COLLATE ${collate}`, err => {
      if (err) throw err;
      console.log(`${tableName} 表編碼轉換成功`);
    });
  },

  // 使用sql
  // dbOperations.UseMySQL(sql, values)
  UseMySQL: function (sql, values = "", explain = "") {
    connection.query(sql, values, (err) => {
      if (err) throw err;
      console.log(`成功使用SQL :${explain}`)
    })
  },

  insertIntoMenuItems: function (values) {
    return new Promise((resolve, reject) => {
      let sql = `
        INSERT INTO MenuItems (
          Name, 
          Description, 
          Price, 
          CategoryId, 
          Insupply
        ) VALUES (?, ?, ?, ?, ?)
      `;
      // 构建一个数组，包含要插入的值
      const params = [values.Name, values.Description, values.Price, values.CategoryId, values.Insupply];

      connection.query(sql, params, (err, results) => {
        if (err) {
          console.error("插入数据时发生错误: ", err);
          reject(err);
        } else {
          console.log("成功插入資料, 插入的ID: ", results.insertId);
          resolve(results);
        }
      });
    });
  },

  insertProjectDataList: function (projectDataList, categoryMap) {
    let i = 1;
    projectDataList.forEach(item => {
      // 從對照表中取得 category_id
      const categoryId = categoryMap[item.type] || 0; // 如果找不到對應的 category_id，預設為 0
      const sql = "INSERT INTO foods (name, category_id, price, image_url) VALUES (?, ?, ?, ?)";
      const values = [item.product, categoryId, item.price, `/image/product/jpg_${i}.jpg`];
      i++
      dbOperations.UseMySQL(sql, values, `插入 ${item.product}`);
    });
  },

  updateMenuItems: function (values) {
    return new Promise((resolve, reject) => {
      let sql = `
      UPDATE MenuItems SET Name = ?, Description = ?, Price = ?, CategoryId = ?, Insupply = ? WHERE MenuItemId = ? 
      `;
      // 构建一个数组，包含要插入的值
      const params = [values.Name, values.Description, values.Price, values.CategoryId, values.Insupply, values.MenuItemId];

      connection.query(sql, params, (err, results) => {
        if (err) {
          console.error("插入数据时发生错误: ", err);
          reject(err);
        } else {
          console.log("更新資料成功，影響的行數：" + results.affectedRows);
          resolve(results);
        }
      });
    });
  },

  selectFromTable: function (row = "*", tableName, whereClause = '', whereValues = []) {
    // 返回一个新的Promise
    return new Promise((resolve, reject) => {
      let selectSql = `SELECT ${row} FROM ${tableName}` + (whereClause ? ` WHERE ${whereClause}` : '');
      connection.query(selectSql, whereValues, (err, results) => {
        if (err) {
          console.error(err);
          reject(err); // 如果有错误，拒绝Promise
        } else {
          console.log(results);
          resolve(results); // 如果成功，解析Promise
        }
      });
    });
  },

  updateFromTable: function (tableName, columns, whereKey, whereValue) {
    // 构建SET子句
    const setClause = Object.keys(columns).map(key => `${key} = ?`).join(', ');
    // 提取列值
    const columnValues = Object.values(columns);
    // 添加唯一值到查询值数组中
    const queryValues = [...columnValues, whereValue];
    // 构建完整的SQL语句
    let sql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereKey} = ?`;

    // 执行SQL更新
    connection.query(sql, queryValues, (error, results) => {
      if (error) {
        console.error('執行更新失敗:', error);
        return;
      }
      console.log(`更新資料成功，影響的行數：${results.affectedRows}`);
    });
  },
  // 更新表中的資料 不好用乾脆直接寫
  // updateTableDatas: function (tableName, updateMapping, whereClause, values) {
  //   let setClause = Object.keys(updateMapping).map(key => `${key} = ?`).join(',');
  //   let updateValues = [...Object.values(updateMapping), ...values];
  //   let updateSql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
  //   connection.query(updateSql, updateValues, (err, results) => {
  //     if (err) throw err;
  //     console.log('更新資料成功，影響的行數：', results.affectedRows);
  //   });
  // },

  // 增加列表欄 表名稱 列名稱 資料型別
  addColumn: function (tableName, columnName, dataType) {
    let alterSql = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${dataType}`;
    connection.query(alterSql, (err, results) => {
      if (err) throw err;
      console.log('列表欄已增加');
    });
  },

  // 移除列表欄 表名稱 列名稱 
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
      console.log('刪除資料成功，影響的行數：' + results.affectedRows);
    });
  },

  // 刪除表中的資料
  deleteMenuItems: function (values) {
    return new Promise((resolve, reject) => {
      let sql = `DELETE FROM MenuItems WHERE MenuItemId = ? `;
      const params = [values.MenuItemId];

      connection.query(sql, params, (err, results) => {
        if (err) {
          console.error("刪除資料时发生错误: ", err);
          reject(err);
        } else {
          console.log("刪除資料成功，影響的行數：" + results.affectedRows);
          resolve(results);
        }
      });
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

// 桌子還要加入用餐中或是空桌
module.exports = dbOperations;