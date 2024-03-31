const fs = require('fs');
const path = require('path')
const moment = require('moment');
const mime = require('mime-types');
const mysql = require('mysql2/promise');

require('dotenv').config();

const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;

const pool = mysql.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  charset: "utf8mb4",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const dbOperations = {
  getConnection() { return pool },

  closeConnection() { pool.end() },

  // dbOperations.UseMySQL(sql語法, 參數陣列, 說明內容)
  async UseMySQL(sql, values = [], explain = "") {
    try {
      const [results] = await pool.query(sql, values);
      console.log(`${explain}`);

      // 判断是否是查询操作
      if (sql.trim().toLowerCase().startsWith("select")) {
        return results; // 对于查询，返回结果数组
      } else {
        // 对于非查询操作，返回结果对象，包含 affectedRows
        // 注意：根据您使用的数据库客户端库，可能需要调整 results 对象的访问方式
        return {
          affectedRows: results.affectedRows, // 假设 results 对象直接包含 affectedRows
          // 对于 mysql2，可能直接是 results.affectedRows
          // 如果您使用的是事务或其它包装，可能需要调整这里的路径
        };
      }
    } catch (error) {
      console.error('数据库操作失败:', error);
      throw error; // 抛出错误，让调用者可以捕获
    }
  },

  async dropDatabase(databaseName) {
    const sql = `DROP DATABASE IF EXISTS ${databaseName}`;
    try {
      await pool.query(sql);
      console.log(`数据库 ${databaseName} 删除成功。`);
    } catch (error) {
      console.error(`删除数据库 ${databaseName} 失败:`, error);
      throw error;
    }
  },

  async createDatabase(databaseName) {
    const sql = `CREATE DATABASE IF NOT EXISTS ${databaseName}`;
    try {
      await pool.query(sql);
      console.log(`数据库 ${databaseName} 创建成功。`);
    } catch (error) {
      console.error(`创建数据库 ${databaseName} 失败:`, error);
      throw error;
    }
  },

  async useDatabase(databaseName) {
    try {
      await pool.query(`USE ${databaseName}`);
      console.log(`已切换到数据库 ${databaseName}`);
    } catch (error) {
      console.error(`切换数据库时出错: ${error.message}`);
      throw error;
    }
  },

  async createTable(tableName, tableDefinition) {
    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${tableDefinition})`;
    try {
      await pool.query(sql);
      console.log(`数据表 ${tableName} 创建成功。`);
    } catch (error) {
      console.error(`创建数据表 ${tableName} 失败:`, error);
      throw error;
    }
  },
  async insertMenuItemsData(MenuItemsData, categoryMap) {
    let i = 1;
    for (const MenuItem of MenuItemsData) {
      const categoryId = categoryMap[MenuItem.Category] || 0;
      const sql = "INSERT INTO MenuItems (MenuItemName, CategoryId, Price, image_url) VALUES (?, ?, ?, ?)";
      const values = [MenuItem.MenuItemName, categoryId, MenuItem.Price, `/image/product/jpg_${i}.jpg`];
      i++;
      await dbOperations.UseMySQL(sql, values, `插入 ${MenuItem.MenuItemName}`);
    }
  },
  // 清空資料表
  async truncateTable(tableName) {
    try {
      const sql = `TRUNCATE TABLE ${tableName}`;
      await pool.query(sql);
      console.log(`数据表 ${tableName} 已清空。`);
    } catch (error) {
      console.error(`清空数据表 ${tableName} 失败:`, error);
    }
  },
  async initTable(number) {
    await dbOperations.truncateTable("Tables")
    for (i = 1; i <= number; i++) {
      await dbOperations.UseMySQL(`
      INSERT INTO Tables (TableNumber) 
      VALUES (?)`,
        [i],
        `加入 桌號${i}`)
    }
  },
  async editTableStatus(TableNumber, TablesStatus) {
    await dbOperations.UseMySQL(`
      UPDATE Tables SET TablesStatus = ? WHERE TableNumber = ?`,
      [`${TablesStatus}`, TableNumber],
      `更改 桌號 ${TableNumber} 狀態為 ${TablesStatus}`)
  },
  async generateMainOrderId() {
    return 'ORD' + new Date().getTime() + Math.random().toString(36).substring(2, 15);
  },
  async makeNewMainOrder(MainOrderId) {
    const TableId = Math.floor(Math.random() * 12) + 1;//隨機生成1~12
    await dbOperations.UseMySQL(`
    INSERT INTO MainOrders (MainOrderId, TableId) 
    VALUES (?, ?)`, [MainOrderId, TableId],
      `加入新的 主訂單${MainOrderId}`)
  },
  async editMainOrderStatus(MainOrderId, OrderStatus) {
    await dbOperations.UseMySQL(`
      UPDATE MainOrders SET OrderStatus = ? WHERE MainOrderId = ?`,
      [`${OrderStatus}`, MainOrderId],
      `更改 主訂單 ${MainOrderId} 狀態為 ${OrderStatus}`)
  },
  async makeNewSubOrder(MainOrderId, SubOrderId) {
    const TableId = Math.floor(Math.random() * 12) + 1;//隨機生成1~12
    await dbOperations.UseMySQL(`
      INSERT INTO SubOrders (SubOrderId, MainOrderId, TableId) 
      VALUES (?, ?, ?)`, [SubOrderId, MainOrderId, TableId],
      `加入新的 子訂單${SubOrderId}`
    )
  },
  async editSubOrderStatus(SubOrderId, OrderStatus) {
    await dbOperations.UseMySQL(`
      UPDATE SubOrders SET OrderStatus = ? WHERE SubOrderId = ?`,
      [`${OrderStatus}`, SubOrderId],
      `更改 子訂單 ${SubOrderId} 狀態為 ${OrderStatus}`)
  },
  async fetchMenuItemInfo(menuItemId) {
    // 取得選單項目信息
    return await dbOperations.UseMySQL(`
      SELECT * FROM MenuItems WHERE Id = ?`,
      [menuItemId],
      `取得 品項 ${menuItemId} 價格`);
  },

  async processSubOrderMappings(SubOrderId, item, unit_price, total_price) {
    // 處理子訂單映射
    return await dbOperations.UseMySQL(`
      INSERT INTO SubOrderMappings (SubOrderId, MenuItemId, quantity, unit_price, total_price) 
      VALUES (?, ?, ?, ?, ?)`,
      [SubOrderId, item.MenuItemId, item.quantity, unit_price, total_price],
      `加入 子訂單 ${SubOrderId} 與品項 ${item.MenuItemId} 對照表 數量 ${item.quantity} 價格 ${unit_price} 總價 ${total_price}`);
  },

  async updateMainOrderMappings(MainOrderId, item, totalQuantity, unit_price, total_price) {
    // 更新主訂單映射
    const updateResult = await dbOperations.UseMySQL(`
      UPDATE MainOrderMappings SET quantity = quantity + ?, total_price = total_price + ? 
      WHERE MainOrderId = ? AND MenuItemId = ?`,
      [totalQuantity, total_price, MainOrderId, item.MenuItemId],
      `更新 主訂單 ${MainOrderId} 與品項 ${item.MenuItemId} 對照表 數量 ${totalQuantity} 價格 ${unit_price} 總價 ${total_price}`);
    if (updateResult.affectedRows === 0) {
      await dbOperations.UseMySQL(`
        INSERT INTO MainOrderMappings (MainOrderId, MenuItemId, quantity, unit_price, total_price) 
        VALUES (?, ?, ?, ?, ?)`,
        [MainOrderId, item.MenuItemId, totalQuantity, unit_price, total_price],
        `加入 主訂單 ${MainOrderId} 與品項 ${item.MenuItemId} 對照表 數量 ${totalQuantity} 價格 ${unit_price} 總價 ${total_price}`);
    }
  },
  // 更新子訂單總計
  async updateSubOrderTotal(SubOrderId, subOrderTotal) {
    await dbOperations.UseMySQL(`
        UPDATE SubOrders SET SubTotal = ? WHERE SubOrderId = ?`,
      [subOrderTotal, SubOrderId],
      `更新子訂單 ${SubOrderId} 總金額 為 ${subOrderTotal}`);
  },
  async getMainOrderIdBySubOrderId(SubOrderId) {
    const result = await dbOperations.UseMySQL(`
      SELECT MainOrderId FROM SubOrders WHERE SubOrderId = ?`,
      [SubOrderId],
      `查询子订单 ${SubOrderId} 的主订单ID`);
    if (Array.isArray(result) && result.length > 0) {
      console.log(`子订单 ${SubOrderId} 的 主订单ID 為 ${result[0].MainOrderId}`);
      return result[0].MainOrderId;
    } else {
      console.log(`查询结果:`, result);
      throw new Error(`子订单 ${SubOrderId} 不存在或没有对应的主订单ID`);
    }
  },
  async calculateTotalFromMainOrderMappings(MainOrderId) {
    // 根據主訂單的MainOrderMappings計算總金額
    const result = await dbOperations.UseMySQL(`
    SELECT COALESCE(SUM(total_price), 0) AS TotalAmount FROM MainOrderMappings WHERE MainOrderId = ?`,
      [MainOrderId],
      `用 MainOrderMappings 計算主訂單 ${MainOrderId} 的總金額`);
    if (Array.isArray(result) && result.length > 0) {
      console.log(`根據 MainOrderMappings 表計算 主訂單 ${MainOrderId} 的總額為 ${result[0].TotalAmount}。`);
      return result[0].TotalAmount;
    }
    return 0; // Return 0 if there's no data
  },
  async calculateMainOrderTotal(MainOrderId) {
    // 把相同主訂單的子訂單金額加總
    const results = await dbOperations.UseMySQL(`
        SELECT SUM(total_price) AS TotalAmount FROM SubOrderMappings
        JOIN SubOrders ON SubOrders.SubOrderId = SubOrderMappings.SubOrderId
        WHERE SubOrders.MainOrderId = ?`,
      [MainOrderId],
      `用 子訂單 计算主訂單 ${MainOrderId} 的總金額`);

    if (results.length > 0 && results[0].TotalAmount != null) {
      console.log(`主訂單 ${MainOrderId} 的總額為 ${results[0].TotalAmount}。`);
      return results[0].TotalAmount;
    } else {
      return 0; // If there are no records, the TotalAmount amount is 0.
    }
  },
  async currentMainOrderTotal() {
    await dbOperations.UseMySQL(`
    SELECT Total FROM MainOrders WHERE MainOrderId = ?`,
      [MainOrderId],
      `獲取主訂單 ${MainOrderId} 當前總金額`);
  },
  async updateMainOrderTotal(MainOrderId, total) {
    // 更新主订单总金额
    await dbOperations.UseMySQL(`
      UPDATE MainOrders SET Total = ? WHERE MainOrderId = ?`,
      [total, MainOrderId],
      `更新主訂單 ${MainOrderId} 總金額 為 ${total}`);
  },

  // 驗證總額是否匹配的函式
  async verifyTotals(MainOrderId) {
    const totalFromMappings = await dbOperations.calculateTotalFromMainOrderMappings(MainOrderId);
    const totalFromSubOrders = await dbOperations.calculateMainOrderTotal(MainOrderId);

    // 直接比較計算得出的總額。之前的方法可能不會準確反映即時更改，除非進行額外的步驟將新總額更新到數據庫中，這似乎是缺失的。
    if (totalFromMappings === totalFromSubOrders) {
      console.log(`主訂單 ${MainOrderId} 的總額驗證成功，數據一致。`);
    } else {
      console.error(`主訂單 ${MainOrderId} 的總額驗證失敗，數據不一致。`);
    }
  }

};

module.exports = dbOperations;