const mysql = require('mysql');
require('dotenv').config();
const moment = require('moment');
const fs = require('fs');
const path = require('path')
const mime = require('mime-types');

const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;

const local = mysql.createConnection({
  connectionLimit: 20, // 連接池大小
  host: MYSQL_HOST, // 資料庫伺服器地址
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  charset: "utf8mb4",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 給雲端用的
// const aws = mysql.createConnection({
//   host: 'fangfoodbackend-v3-instance-1.cd08s4082uws.ap-northeast-1.rds.amazonaws.com', // RDS终端节点
//   user: "admin",
//   password: "",
//   charset: "utf8mb4",
//   port: 3306
// });

// 決定要用哪一個資料庫
const pool = local

const dbOperations = {
  // dbOperations.UseMySQL(sql, values)
  UseMySQL: function (sql, values = "", explain = "") {
    return new Promise((resolve, reject) => {
      pool.query(sql, values, (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(results);
        console.log(`成功使用SQL :${explain}`)
      })
    })
  },// 建立資料庫連接
  // dbOperations.createConnection('localhost', 'root', '', '', 'utf8mb4')
  createConnection: function (host = 'localhost', user = 'root', password = '', database = "", charset = 'utf8mb4') {
    const pool = mysql.createConnection({
      host: host,
      user: user,
      password: password,
      database: database,
      charset: charset
    })
    return pool
  },

  // 直接返回SQL物件
  // dbOperations.getConnection()
  getConnection: function () {
    return pool
  },

  // 建立連接
  // dbOperations.connectToSQL()
  connectToSQL: function () {
    pool.connect(err => {
      if (err) {
        console.error('連接資料庫失敗: ' + err.stack);
        return;
      }
      // console.log('資料庫連接成功，連接 ID ' + pool.threadId);
    });
  },

  // 創建資料庫（如果不存在）
  // dbOperations.createDatabase("databaseName")
  createDatabase: function (databaseName) {
    pool.query(`CREATE DATABASE IF NOT EXISTS ${databaseName} CHARACTER SET utf8 COLLATE utf8_general_ci;`, (err) => {
      if (err) throw err;
      // console.log(`${databaseName} 資料庫已創建或已存在`);
    });
  },
  //CREATE DATABASE restaurant_order CHARACTER SET utf8 COLLATE utf8_general_ci;

  // 轉換數據庫編碼
  // dbOperations.alterDatabaseCharset("databaseName", "utf8mb4", "utf8mb4_unicode_ci")
  alterDatabaseCharset: function (databaseName, charset = 'utf8mb4', collate = 'utf8mb4_unicode_ci') {
    pool.query(`ALTER DATABASE ${databaseName} CHARACTER SET = ${charset} COLLATE = ${collate}`, err => {
      if (err) throw err;
      // console.log(`${databaseName} 資料庫編碼轉換成功`);
    });
  },

  // 選擇資料庫
  // dbOperations.useDatabase("databaseName")
  useDatabase: function (databaseName) {
    pool.query(`USE ${databaseName}`, err => {
      if (err) throw err;
      // console.log(`已選擇 ${databaseName} 資料庫`);
    });
  },


  // 一次創建很多個表
  // dbOperations.createTables(sql[])
  createTables: function (queries) {
    queries.forEach((_query, index) => {
      pool.query(_query, function (err, results) {
        if (err) throw err;
        // console.log(`Table ${index + 1} created`);

        // 當所有表都已創建完畢，關閉連接
        if (index === queries.length - 1) pool.end();
      });
    });
  },

  // 轉換表編碼
  // dbOperations.alterTableCharset("databaseName")
  alterTableCharset: function (tableName, charset = 'utf8mb4', collate = 'utf8mb4_unicode_ci') {
    pool.query(`ALTER TABLE ${tableName} CONVERT TO CHARACTER SET ${charset} COLLATE ${collate}`, err => {
      if (err) throw err;
      // console.log(`${tableName} 表編碼轉換成功`);
    });
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

      pool.query(sql, params, (err, results) => {
        if (err) {
          console.error("插入数据时发生错误: ", err);
          reject(err);
        } else {
          // console.log("成功插入資料, 插入的ID: ", results.insertId);
          resolve(results);
        }
      });
    });
  },
  // const Items = {
  //   MenuItemId: 20,
  //   Name: "Name",
  //   Description: "Description",
  //   Price: 0.33,
  //   CategoryId: 2,
  //   Insupply: true
  // };

  // // pool.insertIntoMenuItems(Items)
  // pool.updateMenuItems(Items)

  // // 表名稱 列名稱 列值
  // pool.updateFromTable(
  //   'MenuItems', // 表名
  //   { // 要更新的列及其新值
  //     Name: "Updated Name",
  //     Description: "Updated Description",
  //     Price: 0.33,
  //     CategoryId: 2,
  //     Insupply: true
  //   },
  //   'MenuItemId', // 更新条件
  //   8 // 条件匹配值
  // );

  // pool.deleteFromTable("MenuItems", "MenuItemId", 9)
  // pool.selectFromTable("MenuItemId, Name, Description, Price, CategoryId, InSupply", "MenuItems")

  // 把傳入的物品都放在這個路徑 /image/product/jpg_${i}.jpg
  insertMenuItemsData: function (MenuItemsData, categoryMap) {
    let i = 1;
    MenuItemsData.forEach(MenuItem => {
      // console.log("從對照表中取得 category_id 如果找不到對應的 category_id，預設為 0")
      const categoryId = categoryMap[MenuItem.Category] || 0; 
      const sql = "INSERT INTO MenuItems (MenuItemName, CategoryId, Price, image_url) VALUES (?, ?, ?, ?)";
      const values = [MenuItem.MenuItemName, categoryId, MenuItem.Price, `/image/product/jpg_${i}.jpg`];
      i++
      dbOperations.UseMySQL(sql, values, `插入 ${MenuItem.MenuItemName}`);
    });
  },

  updateMenuItems: function (values) {
    return new Promise((resolve, reject) => {
      let sql = `
      UPDATE MenuItems SET Name = ?, Description = ?, Price = ?, CategoryId = ?, Insupply = ? WHERE MenuItemId = ? 
      `;
      // 构建一个数组，包含要插入的值
      const params = [values.Name, values.Description, values.Price, values.CategoryId, values.Insupply, values.MenuItemId];

      pool.query(sql, params, (err, results) => {
        if (err) {
          console.error("插入数据时发生错误: ", err);
          reject(err);
        } else {
          // console.log("更新資料成功，影響的行數：" + results.affectedRows);
          resolve(results);
        }
      });
    });
  },

  selectFromTable: function (row = "*", tableName, whereClause = '', whereValues = []) {
    // 返回一个新的Promise
    return new Promise((resolve, reject) => {
      let selectSql = `SELECT ${row} FROM ${tableName}` + (whereClause ? ` WHERE ${whereClause}` : '');
      pool.query(selectSql, whereValues, (err, results) => {
        if (err) {
          console.error(err);
          reject(err); // 如果有错误，拒绝Promise
        } else {
          // console.log(results);
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
    pool.query(sql, queryValues, (error, results) => {
      if (error) {
        console.error('執行更新失敗:', error);
        return;
      }
      // console.log(`更新資料成功，影響的行數：${results.affectedRows}`);
    });
  },
  // 更新表中的資料 不好用乾脆直接寫
  // updateTableDatas: function (tableName, updateMapping, whereClause, values) {
  //   let setClause = Object.keys(updateMapping).map(key => `${key} = ?`).join(',');
  //   let updateValues = [...Object.values(updateMapping), ...values];
  //   let updateSql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
  //   pool.query(updateSql, updateValues, (err, results) => {
  //     if (err) throw err;
  //     // console.log('更新資料成功，影響的行數：', results.affectedRows);
  //   });
  // },

  // 增加列表欄 表名稱 列名稱 資料型別
  addColumn: function (tableName, columnName, dataType) {
    let alterSql = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${dataType}`;
    pool.query(alterSql, (err, results) => {
      if (err) throw err;
      // console.log('列表欄已增加');
    });
  },

  // 移除列表欄 表名稱 列名稱 
  removeColumn: function (tableName, columnName) {
    let alterSql = `ALTER TABLE ${tableName} DROP COLUMN ${columnName}`;
    pool.query(alterSql, (err, results) => {
      if (err) throw err;
      // console.log('列表欄已移除');
    });
  },

  // deleteFromTable("menu_items","name", ['漢堡'])
  // 刪除表中的資料
  deleteFromTable: function (tableName, dataName, values) {
    pool.query(`DELETE FROM ${tableName} WHERE ${dataName} = ?`, values, (err, results) => {
      if (err) throw err;
      // console.log('刪除資料成功，影響的行數：' + results.affectedRows);
    });
  },

  // 刪除表中的資料
  deleteMenuItems: function (values) {
    return new Promise((resolve, reject) => {
      let sql = `DELETE FROM MenuItems WHERE MenuItemId = ? `;
      const params = [values.MenuItemId];

      pool.query(sql, params, (err, results) => {
        if (err) {
          console.error("刪除資料时发生错误: ", err);
          reject(err);
        } else {
          // console.log("刪除資料成功，影響的行數：" + results.affectedRows);
          resolve(results);
        }
      });
    });
  },

  // 刪除資料表
  dropTable: function (tableName) {
    pool.query(`DROP TABLE IF EXISTS ${tableName}`, (err, results) => {
      if (err) throw err;
      // console.log(`${tableName} 資料表已刪除或原本就不存在`);
    });
  },

  // 刪除資料庫
  dropDatabase: function (databaseName) {
    pool.query(`DROP DATABASE IF EXISTS ${databaseName}`, (err, results) => {
      if (err) throw err;
      // console.log(`${databaseName} 資料庫已刪除或原本就不存在`);
    });
  },

  // 關閉資料庫連接
  closeConnection: function () {
    pool.end(err => {
      if (err) return console.error('關閉資料庫連接時出錯：', err);
      // console.log('資料庫連接已關閉');
    });
  },

  editFood: async (id, formData, imageFile) => {
    return new Promise((resolve, reject) => {
      var image_path = '';
      if (imageFile) {
        const image_name = dbOperations.uploadImage(imageFile, './public/uploads/foods');
        image_path = '/uploads/foods/' + image_name;
      }

      var sqlStr = `UPDATE foods SET name = ?, price = ?, category_id = ?`;
      var values = [formData['item-name'], formData['item-price'], formData['select-type']];
      if (image_path) {
        sqlStr += `, image_url = ?`;
        values.push(image_path)
      }
      sqlStr += ` WHERE id = ?`;
      values.push(id);

      pool.query(sqlStr, values, (error, results) => {

        if (error) {
          reject(error);
          return;
        }
        resolve(results)
      });
    })
  },
  //僅可刪除尚未結帳訂單之食材
  deleteOrderFood: (orderId, foodId) => {
    return new Promise(async (resolve, reject) => {
      var order = await dbOperations.getOrderById(orderId)
      if (!order || order.order_status != 1) {
        reject('此訂單已結帳或不存在')
        return;
      }
      pool.query(`DELETE FROM orders_items where order_id = ? AND food_id = ?`, [orderId, foodId], (error, results) => {

        if (error) {
          reject(error);
          return;
        }
        resolve(results)
      });

    })
  },
  deleteFood: async (id) => {
    return new Promise((resolve, reject) => {
      pool.query('UPDATE foods SET deleted_at = CURRENT_TIMESTAMP where id = ?', [id], (error, results) => {

        if (error) {
          reject(error);
          return;
        }
        resolve(results)
      });

    })
  },
  getFoodsWithTrash: async () => {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM foods', (error, results) => {

        if (error) {
          reject(error);
          return;
        }
        resolve(results)
      });
    })
  },
  getFoods: async () => {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM foods where deleted_at IS NULL', (error, results) => {

        if (error) {
          reject(error);
          return;
        }
        resolve(results)
      });

    })
  },
  getFoodCateories: async () => {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM foods_category ORDER BY sort ASC', (error, results) => {

        if (error) {
          reject(error);
          return;
        }
        resolve(results)
      });
    })
  },
  //取得訂單ById
  getOrderById: async (id) => {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM table_orders where id = ?', [id], (error, results) => {

        if (error) {
          reject(error);
          return;
        }
        resolve(results.length ? results[0] : null)
      });
    })
  },
  //取得訂單ById
  getTradeNoById: async (id) => {
    return new Promise((resolve, reject) => {
      pool.query('SELECT trade_no FROM table_orders where id = ?', [id], (error, results) => {

        if (error) {
          reject(error);
          return;
        }
        resolve(results.length ? results[0] : null)
      });
    })
  },
  //取得訂單ByTradeNo
  getOrderByTradeNo: async (trade_no) => {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM table_orders where trade_no = ?', [trade_no], (error, results) => {

        if (error) {
          reject(error);
          return;
        }
        resolve(results.length ? results[0] : null)
      });
    })
  },
  //取得用餐中訂單
  getPendingTableOrders: async () => {
    console.log("使用取得訂單功能")
    return new Promise((resolve, reject) => {
      console.log("正在發送取得訂單請求")
      pool.query('SELECT * FROM table_orders where order_status = 1', (error, results) => {

        if (error) {
          reject(error);
          return;
        }
        resolve(results)
      });
    })
  },
  addTableOrder: async (tableNum) => {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM table_orders WHERE order_status = 1 AND table_number = ?', [tableNum], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        if (results.length > 0) {
          reject('此桌號目前已有訂單');
        } else {
          pool.query('INSERT INTO table_orders (trade_no, table_number) VALUES(?,?)', [
            dbOperations.genearteTradeNo(),
            tableNum
          ], (error, results) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(results)
          });
        }
      });
    })
  },
  clearOrderFoods: async (orderId) => {
    return new Promise((resolve, reject) => {
      pool.query('DELETE FROM orders_items where order_id = ?', [orderId], (error, results) => {

        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      });
    })
  },
  //取得產品品項
  getOrderFoods: async (orderId) => {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM orders_items where order_id = ?', [orderId], (error, results) => {

        if (error) {
          reject(error);
          return;
        }
        resolve(results)
      });
    })
  },
  /**
   * 疊加產品
   * [{id: food_id, item: 數量}]
   * 先取出後加在一起，全部刪除後，再寫入
   */
  appendOrderFoods: async (orderId, data) => {
    var foods = await dbOperations.getOrderFoods(orderId);
    var newData = data;
    foods.forEach((f) => {
      var index = newData.findIndex((item) => item.id == f.food_id);
      if (index > -1) {
        newData[index].item += f.quantity;
      } else {
        newData.push({ id: f.food_id, item: f.quantity });
      }
    });
    await dbOperations.clearOrderFoods(orderId);
    return await dbOperations.updateOrderFoods(orderId, newData);
  },
  //[{id: food_id, item: 數量}]  
  updateOrderFoods: (orderId, data) => {
    return new Promise(async (resolve, reject) => {
      const foods = await dbOperations.getFoods();
      var sqlStr = 'INSERT INTO orders_items (order_id, food_id, quantity, unit_price, total_price) VALUES';
      var valuesSet = [];
      var values = [];
      data.forEach((item) => {
        var foodItem = foods.find((f) => f.id == item.id);
        if (foodItem) {
          valuesSet.push('(?,?,?,?,?)');
          values.push(orderId, foodItem.id, item.item, foodItem.price, item.item * foodItem.price);
        }
      });
      sqlStr += valuesSet.join(',');

      await dbOperations.clearOrderFoods(orderId); //先清除
      pool.query(sqlStr, values, (error, results) => {

        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      });

    })
  },
  //完成現金付款
  confirmPaymentByCash: (order_id) => {
    return new Promise(async (resolve, reject) => {
      console.log("取得訂單資訊 ")
      const order = await dbOperations.getOrderById(order_id);
      const order_foods = await dbOperations.getOrderFoods(order_id);
      console.log("檢查是否有資料 ")
      if (order && order_foods.length) {
        console.log("有資料，整理結帳後訂單所需資訊")
        const food_price = order_foods.map((x) => x.quantity * x.unit_price).reduce((x, y) => x + y, 0);
        const service_fee = Math.round(food_price * 10 / 100);
        const trade_amt = food_price + service_fee;
        const order_status = 2;
        console.log("改變訂單狀態為以結帳 ")
        pool.query('UPDATE table_orders SET food_price = ?, service_fee = ?, trade_amt = ?, order_status = ?, payment_at = CURRENT_TIMESTAMP WHERE id = ?', [food_price, service_fee, trade_amt, order_status, order_id], (error, results) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(true);
        });
      } else {
        reject('查無訂單或訂單無品項')
        return
      }
    })

  },
  //一鍵結帳全部
  OneClickCheckoutAll: () => {
    return new Promise((resolve, reject) => {
      pool.query(
        `UPDATE table_orders 
                 SET food_price = ?, 
                 service_fee = ?, 
                 trade_amt = ?, 
                 order_status = ?, 
                 payment_at = CURRENT_TIMESTAMP 
                 WHERE order_status = ?`,
        [0, 0, 0, 2, 1], (error, results) => {
          if (error) {
            reject(error);
            return;
          }
          // console.log(results);
          resolve(results);
        });
    });
  },
  getReport: async () => {
    return new Promise(async (resolve, reject) => {
      try {
        let m12_start = moment().startOf('month').subtract(12, 'months').format('YYYY-MM-DD 00:00:00');
        let m12_end = moment().endOf('month').format('YYYY-MM-DD 23:59:59');

        const dayTurnoverSql = `SELECT SUM(trade_amt) as trade_amt FROM table_orders WHERE DATE(payment_at) = CURDATE() AND order_status = 2`;
        const monthTurnoverSql = `SELECT SUM(trade_amt) as trade_amt FROM table_orders WHERE MONTH(payment_at) = MONTH(CURDATE()) AND YEAR(payment_at) = YEAR(CURDATE()) AND order_status = 2`;
        const rankTop5Sql = `SELECT food_id, SUM(quantity) as total FROM orders_items oi LEFT JOIN table_orders o ON o.id = oi.order_id WHERE o.order_status = 2 AND YEAR(payment_at) = YEAR(CURDATE()) AND MONTH(payment_at) = MONTH(CURDATE()) GROUP BY food_id ORDER BY total DESC LIMIT 5`;
        const monthTurnoverOfYearSql = `SELECT YEAR(payment_at) as year, MONTH(payment_at) as month, SUM(trade_amt) as price FROM table_orders WHERE (payment_at BETWEEN '${m12_start}' AND '${m12_end}') AND order_status = 2 GROUP BY YEAR(payment_at), MONTH(payment_at)`;

        // Execute each SQL query one by one
        const dayTurnoverResult = await dbOperations.UseMySQL(dayTurnoverSql);
        const monthTurnoverResult = await dbOperations.UseMySQL(monthTurnoverSql);
        const rankTop5Result = await dbOperations.UseMySQL(rankTop5Sql);
        const monthTurnoverOfYearResult = await dbOperations.UseMySQL(monthTurnoverOfYearSql);

        resolve({
          dayTurnover: dayTurnoverResult[0].trade_amt || 0,
          monthTurnover: monthTurnoverResult[0].trade_amt || 0,
          rankTop5: rankTop5Result,
          monthTurnoverOfYear: monthTurnoverOfYearResult
        });
      } catch (error) {
        reject(error);
      }
    });
  },
  genearteTradeNo: () => {
    return 'ORD' + Date.now() + Math.random().toString(36).substring(4);
  },
  // 檢查目標文件夾是否存在，如果不存在則創建
  ensureDirectoryExistence: (filePath) => {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    dbOperations.ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
  },
  uploadImage: (file, target_dir) => {
    var tmp_path = file.path;
    var image_name = Date.now() + '_' + Math.random().toString(36).substring(7) + '.' + mime.extension(file.mimetype);
    var target_path = path.join(target_dir, image_name);
    dbOperations.ensureDirectoryExistence(target_path); // 確保目標文件夾存在
    fs.rename(tmp_path, target_path, function (err) {
      if (err) throw err; // 如果有錯誤，拋出以便處理
    });
    return image_name;
  },
  uploadFood: async (formData, imageFile) => {
    return new Promise((resolve, reject) => {
      const image_name = dbOperations.uploadImage(imageFile, './public/uploads/foods');
      const image_path = '/uploads/foods/' + image_name;

      pool.query('INSERT INTO foods (name, price, category_id, image_url) VALUES(?,?,?,?)', [
        formData['item-name'],
        formData['item-price'],
        formData['select-type'],
        image_path
      ], (error, results) => {

        if (error) {
          reject(error);
          return;
        }
        resolve(results)
      });
    })
  },

  //計算訂單總價
  calculateOrder: (order_id) => {
    return new Promise(async (resolve, reject) => {
      // // console.log("await ")
      const order = await dbOperations.getOrderById(order_id);
      const order_foods = await dbOperations.getOrderFoods(order_id);
      // // console.log("await ")
      if (order && order_foods.length) {
        // food_price INT NULL,
        // service_fee INT NULL,
        // trade_amt INT NULL,
        // order_status TINYINT DEFAULT 1,
        // // console.log("if ")

        const food_price = order_foods.map((x) => x.quantity * x.unit_price).reduce((x, y) => x + y, 0);
        const service_fee = Math.round(food_price * 10 / 100);
        const trade_amt = food_price + service_fee;
        const order_status = 2;
        // // console.log("getConnection ")


        pool.query('UPDATE table_orders SET food_price = ?, service_fee = ?, trade_amt = ? WHERE id = ?', [food_price, service_fee, trade_amt, order_id], (error, results) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(true);
        });
      } else {
        reject('查無訂單或訂單無品項')
        return
      }
    })
  },


};

// 桌子還要加入用餐中或是空桌
module.exports = dbOperations;