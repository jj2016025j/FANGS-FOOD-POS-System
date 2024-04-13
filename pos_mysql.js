require('dotenv').config();

const mysql = require('mysql2/promise');

const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;
const TEST_MYSQL_DATABASE = process.env.TEST_MYSQL_DATABASE;
const CURRENT_MYSQL_DATABASE = TEST_MYSQL_DATABASE;

let pool

try {
  pool = mysql.createPool({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: TEST_MYSQL_DATABASE,
    charset: "utf8mb4",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} catch {
  console.log("MYSQL未啟動")
}

// console.log(pool)

const dbOperations = {
  getConnection() { return pool },
  async closeConnection() { await pool.end() },
  async UseMySQL(sql, values = [], explain = "") {
    try {
      const [results] = await pool.query(sql, values);
      console.log(`${explain}`);

      // 判断是否是查询操作
      if (sql.trim().toLowerCase().startsWith("select")) {
        return results;
      } else {
        return {
          affectedRows: results.affectedRows,
        };
      }
    } catch (error) {
      console.error('数据库操作失败:', error);
      throw error;
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
  /**
   * 處理資料庫
   */
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
  /**
   * 處理資料表
   * @param {*} tableName 
   * @param {*} tableDefinition 
   */
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
  async truncateTable(tableName) {
    try {
      const sql = `TRUNCATE TABLE ${tableName}`;
      await pool.query(sql);
      console.log(`数据表 ${tableName} 已清空。`);
    } catch (error) {
      console.error(`清空数据表 ${tableName} 失败:`, error);
    }
  },
  /**
   * 處理品項
   * @param {*} menuItem 
   * @param {*} categoryId 
   * @param {*} index 
   */
  async insertIntoMenuItem(menuItem, categoryId, index) {
    const sql = "INSERT INTO MenuItems (MenuItemName, CategoryId, Price, image_url) VALUES (?, ?, ?, ?)";
    const values = [menuItem.MenuItemName, categoryId, menuItem.Price, `/image/product/jpg_${index}.jpg`];
    await dbOperations.UseMySQL(sql, values, `插入 ${menuItem.MenuItemName}`);
  },

  async insertIntoMenuItems(MenuItemsData, categoryMap) {
    let i = 1;
    for (const MenuItem of MenuItemsData) {
      const categoryId = categoryMap[MenuItem.Category] || 0;
      await dbOperations.insertIntoMenuItem(MenuItem, categoryId, i);
      i++;
    }
  },
  async getMenuItemInfo(Id) {
    // 取得選單項目信息
    console.log(`取得 品項 ${Id} 資訊`);
    const result = await pool.query(
      `SELECT * FROM MenuItems WHERE Id = ?`,
      [Id]
    )
    console.log(result[0])
    return result[0]
  },
  async getMenuItems() {
    const sql = 'SELECT * FROM MenuItems WHERE Insupply = TRUE ORDER BY sort ASC';
    try {
      const results = await pool.query(sql);
      console.log("获取所有菜单项成功。");
      return results[0]; // 调整以适应您的数据库
    } catch (error) {
      console.error("获取所有菜单项失败:", error);
      throw error;
    }
  },
  /**
   * 處理分類
   * @returns 
   */
  async getMenuItemCateories() {
    const sql = 'SELECT * FROM Category ORDER BY sort ASC';
    try {
      const results = await pool.query(sql);
      console.log("获取菜单项类别成功。");
      return results[0]; // 调整以适应您的数据库
    } catch (error) {
      console.error("获取菜单项类别失败:", error);
      throw error;
    }
  },
  /**
   * 處理桌號狀態
   * @param {*} number 
   */
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
  async getTableInfoBytableNumber(tableNum) {
    const sql = 'SELECT * FROM Tables WHERE TableNumber = ?';
    try {
      const results = await pool.query(sql, [tableNum]);
      console.log(`获取桌號 ${tableNum} 資訊 ${results[0][0].TablesStatus} 成功。`);
      return results[0][0];
    } catch (error) {
      console.error("获取所有桌子資訊失败:", error);
      throw error;
    }
  },
  async getTableInfoByMainOrderId(MainOrderId) {
    const sql = 'SELECT * FROM Tables WHERE MainOrderId = ?';
    try {
      const results = await pool.query(sql, [MainOrderId]);
      console.log(`获取擁有此訂單 ${MainOrderId} 的桌號資訊 ${results[0][0]} 成功。`);
      return results[0][0];
    } catch (error) {
      console.error("获取桌號資訊失败:", error);
      throw error;
    }
  },
  async getTableNumberByMainOrderId(MainOrderId) {
    const sql = 'SELECT TableNumber FROM Tables WHERE MainOrderId = ?';
    try {
      const results = await pool.query(sql, [MainOrderId]);
      console.log(`获取擁有此訂單 ${MainOrderId} 的桌號資訊 ${results[0][0].TableNumber} 成功。`);
      return results[0][0].TableNumber;
    } catch (error) {
      console.error("获取桌號資訊失败:", error);
      throw error;
    }
  },
  async getTableIdByMainOrderId(MainOrderId) {
    const sql = 'SELECT Id FROM Tables WHERE MainOrderId = ?';
    try {
      const results = await pool.query(sql, [MainOrderId]);
      console.log(`获取擁有此訂單 ${MainOrderId} 的桌號 ${results[0][0].Id} 成功。`);
      return results[0][0].Id;
    } catch (error) {
      console.error("获取桌號資訊失败:", error);
      throw error;
    }
  },
  async getAllTableStatus() {
    const sql = 'SELECT * FROM Tables';
    try {
      const results = await pool.query(sql);
      console.log("获取所有桌號状态成功。");
      return results[0]; // 请根据您使用的数据库客户端调整此处
    } catch (error) {
      console.error("获取所有桌子状态失败:", error);
      throw error;
    }
  },
  async editTableStatus(TableNumber, TablesStatus) {
    try {
      await dbOperations.UseMySQL(`
      UPDATE Tables SET TablesStatus = ? WHERE TableNumber = ?`,
        [`${TablesStatus}`, TableNumber],
        `更改 桌號 ${TableNumber} 狀態為 ${TablesStatus}`)
    } catch (error) {
      console.error("更改桌號状态失败:", error);
      throw error;
    }
  },
  async editTableInfo(TableNumber, TablesStatus, MainOrderId) {
    try {
      const results = await pool.query(`
      UPDATE Tables SET TablesStatus = ?, MainOrderId = ? WHERE TableNumber = ?`,
        [TablesStatus, MainOrderId, TableNumber])
      console.log(`更改 桌號 ${TableNumber} 狀態為 ${TablesStatus}`)
      if (results[0].affectedRows == 1)
        return results[0];
    } catch (error) {
      console.error("更改桌號状态失败:", error);
      throw error;
    }
  },
  /**
   * 處理主訂單相關
   */
  async generateMainOrderId() {
    return 'ORD' + new Date().getTime() + Math.random().toString(36).substring(2, 15);
  },
  async makeNewMainOrder(MainOrderId, TableId) {
    await dbOperations.UseMySQL(`
    INSERT INTO MainOrders (MainOrderId, TableId) 
    VALUES (?, ?)`, [MainOrderId, TableId],
      `加入新的 主訂單${MainOrderId}`)
  },
  async forTestMakeNewMainOrder(MainOrderId) {
    const TableId = Math.floor(Math.random() * 12) + 1;//隨機生成1~12
    await dbOperations.UseMySQL(`
    INSERT INTO MainOrders (MainOrderId, TableId) 
    VALUES (?, ?)`, [MainOrderId, TableId],
      `加入新的 主訂單${MainOrderId}`)
  },
  async editMainOrderStatus(MainOrderId, OrderStatus) {
    try {
      const results = await pool.query(`
        UPDATE MainOrders SET OrderStatus = ? WHERE MainOrderId = ?`,
        [OrderStatus, MainOrderId]);
      console.log(`更改 主訂單 ${MainOrderId} 狀態為 ${OrderStatus}`);
      if (results[0].affectedRows == 1)
        return results[0];
      else {
        console.log(`有重複的主訂單 ${MainOrderId} 或找不到主訂單`);
        return false;
      }
    } catch (error) {
      console.error(`获取主订单 ${MainOrderId} 信息失败:`, error);
      throw error;
    }
  },
  async getMainOrderInfoById(MainOrderId) {
    const sql = 'SELECT * FROM MainOrders WHERE MainOrderId = ?';
    try {
      const results = await pool.query(sql, [MainOrderId]);
      if (results[0][0] == null) {
        console.log(`無此主订单 ${MainOrderId}。`);
        return results[0][0];
      }
      console.log(`获取主订单 ${MainOrderId} 信息成功。`);
      return results[0][0];
    } catch (error) {
      console.error(`获取主订单 ${MainOrderId} 信息失败:`, error);
      throw error;
    }
  },
  async getMainOrderIdBySubOrderId(SubOrderId) {
    const result = await dbOperations.UseMySQL(`
      SELECT MainOrderId FROM SubOrders WHERE SubOrderId = ?`,
      [SubOrderId],
      `開始查询 子订单 ${SubOrderId} 的主订单ID`);
    if (Array.isArray(result) && result.length > 0) {
      console.log(`取得 子订单 ${SubOrderId} 的 主订单ID 為 ${result[0].MainOrderId}`);
      return result[0].MainOrderId;
    } else {
      console.log(`查询结果:`, result);
      throw new Error(`子订单 ${SubOrderId} 不存在或没有对应的主订单ID`);
    }
  },
  async getMainOrderTotalById() {
    await dbOperations.UseMySQL(`
    SELECT Total FROM MainOrders WHERE MainOrderId = ?`,
      [MainOrderId],
      `獲取主訂單 ${MainOrderId} 當前總金額`);
  },
  async getOrders() {
    const result = await pool.query(`
        SELECT * FROM MainOrders
        ORDER BY CreateTime DESC
        LIMIT 50
      `);
    return result[0];
  },
  async updateMainOrderTotal(MainOrderId, total) {
    // 更新主订单总金额
    await dbOperations.UseMySQL(`
      UPDATE MainOrders SET Total = ? WHERE MainOrderId = ?`,
      [total, MainOrderId],
      `更新主訂單 ${MainOrderId} 總金額 為 ${total}`);
  },
  async getMainAndSubOrder(mainOrderId) {
    try {
      // 查询主订单
      const [mainOrder] = await pool.query(
        `SELECT * FROM MainOrders WHERE MainOrderId = ?`, [mainOrderId]
      );

      // 查询子订单
      const [subOrders] = await pool.query(
        `SELECT * FROM SubOrders WHERE MainOrderId = ?`, [mainOrderId]
      );

      // 对于每个子订单，查询关联的菜单项
      for (let subOrder of subOrders) {
        const [items] = await pool.query(
          `SELECT * FROM SubOrderMappings WHERE SubOrderId = ?`, [subOrder.SubOrderId]
        );
        subOrder.items = items; // 将查询结果添加到子订单对象中
        console.log(subOrder.items)
      }

      // 整合结果
      return {
        mainOrder: mainOrder[0], // 假设主订单ID唯一
        subOrders: subOrders,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error');
    }
  },
  async checkOutALL() {
    await pool.query(
      `UPDATE MainOrders set OrderStatus = ? WHERE OrderStatus = ?`,
      ['已結帳', '未結帳']
    );
    console.log(`更改 所有 主訂單 MainOrders 狀態`)
    await pool.query(
      `UPDATE Tables set TablesStatus = ? , MainOrderId = '' WHERE TablesStatus != ?`,
      ['空桌', '空桌']
    );
    console.log(`更改 所有 桌號 Tables 狀態`)
    var AllTableStatus = await dbOperations.getAllTableStatus();
    // console.log("取得所有桌號狀態 : ", AllTableStatus)
    return AllTableStatus;
  },
  /**
     * 處理子訂單相關
     * @param {*} MainOrderId 
     * @returns 
     */
  async generateSubOrderId(MainOrderId) {
    return MainOrderId + '-SUB' + Math.floor(Math.random() * 10000) + 1;
  },
  async forTestMakeNewSubOrder(MainOrderId, SubOrderId) {
    const TableId = Math.floor(Math.random() * 12) + 1;//隨機生成1~12
    await dbOperations.UseMySQL(`
      INSERT INTO SubOrders (SubOrderId, MainOrderId, TableId) 
      VALUES (?, ?, ?)`, [SubOrderId, MainOrderId, TableId],
      `加入新的 子訂單${SubOrderId}`
    )
  },
  async MakeNewSubOrder(MainOrderId) {
    try {
      const TableInfo = await dbOperations.getTableInfoByMainOrderId(MainOrderId);
      console.log(TableInfo.TableNumber)
      const TableNumber = TableInfo.TableNumber
      const SubOrderId = await dbOperations.generateSubOrderId(MainOrderId);
      await pool.query(`
      INSERT INTO SubOrders (SubOrderId, MainOrderId, TableId) 
      VALUES (?, ?, ?)`, [SubOrderId, MainOrderId, TableNumber]
      )
      console.log(`在訂單 ${MainOrderId} 加入新的 子訂單${SubOrderId} 桌號${TableNumber}`)
      return SubOrderId;
    } catch (error) {
      console.error(error);
      throw new Error('建立新訂單失敗');
    }
  },
  async editSubOrderStatus(SubOrderId, OrderStatus) {
    await dbOperations.UseMySQL(`
      UPDATE SubOrders SET OrderStatus = ? WHERE SubOrderId = ?`,
      [`${OrderStatus}`, SubOrderId],
      `更改 子訂單 ${SubOrderId} 狀態為 ${OrderStatus}`)
  },
  // 更新子訂單總計
  async updateSubOrderTotal(SubOrderId, subOrderTotal) {
    await dbOperations.UseMySQL(`
          UPDATE SubOrders SET SubTotal = ? WHERE SubOrderId = ?`,
      [subOrderTotal, SubOrderId],
      `更新子訂單 ${SubOrderId} 總金額 為 ${subOrderTotal}`);
  },
  async sendSubOrder(SubOrderId, SubOrderInfo) {
    // 發送子訂單的函式
    try {
      const MainOrderId = await dbOperations.getMainOrderIdBySubOrderId(SubOrderId);
      await dbOperations.makeNewSubOrderMappings(MainOrderId, SubOrderId, SubOrderInfo);
      const mainOrderTotal = await dbOperations.calculateMainOrderTotal(MainOrderId);
      await dbOperations.updateMainOrderTotal(MainOrderId, mainOrderTotal);
      console.log(`主訂單 ${MainOrderId} 的總金額已更新為 ${mainOrderTotal}`);
    } catch (error) {
      console.error("更新主訂單狀態時出錯：", error.message);
    }
  },
  // 處理並提交新子訂單映射的函式
  async makeNewSubOrderMappings(MainOrderId, SubOrderId, SubOrderInfo) {
    let subOrderTotal = 0;

    for (const item of SubOrderInfo.items) {
      const MenuItemInfo = await dbOperations.getMenuItemInfo(item.Id);
      if (Array.isArray(MenuItemInfo) && MenuItemInfo.length > 0) {
        const unit_price = MenuItemInfo[0].Price;
        const total_price = item.quantity * unit_price;
        subOrderTotal += total_price;
        await dbOperations.processSubOrderMappings(SubOrderId, item, unit_price, total_price);
        await dbOperations.updateMainOrderMappings(MainOrderId, item, item.quantity, unit_price, total_price);
      } else {
        console.error(`品項 ${item.Id} 不存在`);
      }
    }
    await dbOperations.verifyTotals(MainOrderId, subOrderTotal);
    await dbOperations.updateSubOrderTotal(SubOrderId, subOrderTotal);
  },

  /**
   * 處理映射
   * @param {*} SubOrderId 
   * @param {*} item 
   * @param {*} unit_price 
   * @param {*} total_price 
   * @returns 
   */
  async processSubOrderMappings(SubOrderId, item, unit_price, total_price) {
    // 處理子訂單映射
    return await dbOperations.UseMySQL(`
      INSERT INTO SubOrderMappings (SubOrderId, MenuItemId, quantity, unit_price, total_price) 
      VALUES (?, ?, ?, ?, ?)`,
      [SubOrderId, item.Id, item.quantity, unit_price, total_price],
      `加入 子訂單 ${SubOrderId} 與品項 ${item.Id} 對照表 數量 ${item.quantity} 價格 ${unit_price} 總價 ${total_price}`);
  },
  async updateMainOrderMappings(MainOrderId, item, totalQuantity, unit_price, total_price) {
    // 更新主訂單映射
    const updateResult = await dbOperations.UseMySQL(`
      UPDATE MainOrderMappings SET quantity = quantity + ?, total_price = total_price + ? 
      WHERE MainOrderId = ? AND MenuItemId = ?`,
      [totalQuantity, total_price, MainOrderId, item.Id],
      `更新 主訂單 ${MainOrderId} 與品項 ${item.Id} 對照表 數量 ${totalQuantity} 價格 ${unit_price} 總價 ${total_price}`);
    if (updateResult.affectedRows === 0) {
      await dbOperations.UseMySQL(`
        INSERT INTO MainOrderMappings (MainOrderId, MenuItemId, quantity, unit_price, total_price) 
        VALUES (?, ?, ?, ?, ?)`,
        [MainOrderId, item.Id, totalQuantity, unit_price, total_price],
        `加入 主訂單 ${MainOrderId} 與品項 ${item.Id} 對照表 數量 ${totalQuantity} 價格 ${unit_price} 總價 ${total_price}`);
    }
  },
  async insertMainOrderMappings(MainOrderId, mappings) {
    for (const mapping of mappings) {
      // 第一步：根據 MenuItemName 查找 MenuItemId
      const searchSql = `
        SELECT Id FROM MenuItems WHERE MenuItemName = ? LIMIT 1;
      `;
      const searchResults = await dbOperations.UseMySQL(searchSql, [mapping.MenuItemName], "查找菜品ID");
      if (searchResults.length > 0) {
        const MenuItemId = searchResults[0].Id;  // 假設找到了對應的菜品ID

        // 第二步：使用找到的 MenuItemId 進行插入
        const insertSql = `
          INSERT INTO MainOrderMappings (MainOrderId, MenuItemId, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?);
        `;
        const values = [
          MainOrderId,
          MenuItemId,  // 使用查找到的 MenuItemId
          mapping.quantity,
          mapping.unit_price,
          mapping.total_price
        ];
        await dbOperations.UseMySQL(insertSql, values, `插入主訂單 ${MainOrderId} 映射 ${MenuItemId}`);
      } else {
        console.error(`未找到菜品名稱為 "${mapping.MenuItemName}" 的菜品ID`);
      }
    }
  },
  /**
   * 計算的部分
   * @param {*} MainOrderId 
   * @returns 
   */
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
  /**
   * 驗證
   * @param {*} MainOrderId 
   */
  async verifyTotals(MainOrderId) {
    const totalFromMappings = await dbOperations.calculateTotalFromMainOrderMappings(MainOrderId);
    const totalFromSubOrders = await dbOperations.calculateMainOrderTotal(MainOrderId);

    // 直接比較計算得出的總額。之前的方法可能不會準確反映即時更改，除非進行額外的步驟將新總額更新到數據庫中，這似乎是缺失的。
    if (totalFromMappings === totalFromSubOrders) {
      console.log(`主訂單 ${MainOrderId} 的總額驗證成功，數據一致。`);
    } else {
      console.error(`主訂單 ${MainOrderId} 的總額驗證失敗，數據不一致。`);
    }
  },

  /**
  * 生成SQL查詢的時間條件
  * @param {string} timeRange - 時間範圍
  * @returns {string} SQL的時間條件
  */
  generateTimeCondition(timeRange, tableName = 'MainOrders') {
    switch (timeRange) {
      case 'last24Hours':
        return `${tableName}.CreateTime >= NOW() - INTERVAL 24 HOUR`;
      case 'lastWeek':
        return `${tableName}.CreateTime >= CURDATE() - INTERVAL 7 DAY`;
      case 'lastMonth':
        return `${tableName}.CreateTime >= CURDATE() - INTERVAL 1 MONTH`;
      case 'last6Months':
        return `${tableName}.CreateTime >= CURDATE() - INTERVAL 6 MONTH`;
      case 'lastYear':
        return `${tableName}.CreateTime >= CURDATE() - INTERVAL 1 YEAR`;
      case 'all':
        return '1=1'; // 没有时间限制
      default:
        throw new Error('Invalid time range');
    }
  },
  /**
   * 處理報表查詢
   * @param {*} timeRange 
   * @param {*} queryType 
   * @returns 
   */
  async getBackEndData(timeRange, queryType) {
    const timeCondition = dbOperations.generateTimeCondition(timeRange, 'MainOrders');

    let sql = '';
    switch (queryType) {
      case 'all':
        sql = `SELECT DATE_FORMAT(MainOrders.CreateTime, '%Y-%m-%d') AS OrderDate, 
             SUM(MainOrderMappings.quantity) AS TotalQuantity, 
             SUM(MainOrderMappings.total_price) AS TotalSales 
             FROM MainOrders 
             JOIN MainOrderMappings ON MainOrders.MainOrderId = MainOrderMappings.MainOrderId 
             WHERE ${timeCondition} 
             GROUP BY OrderDate 
             ORDER BY OrderDate`;
        break;
      case 'byCategory':
        sql = `SELECT Category.CategoryName, 
             DATE_FORMAT(MainOrders.CreateTime, '%Y-%m-%d') AS OrderDate, 
             SUM(MainOrderMappings.quantity) AS TotalQuantity, 
             SUM(MainOrderMappings.total_price) AS TotalSales 
             FROM MainOrders 
             JOIN MainOrderMappings ON MainOrders.MainOrderId = MainOrderMappings.MainOrderId 
             JOIN MenuItems ON MainOrderMappings.MenuItemId = MenuItems.Id 
             JOIN Category ON MenuItems.CategoryId = Category.Id 
             WHERE ${timeCondition} 
             GROUP BY Category.CategoryName, OrderDate 
             ORDER BY Category.CategoryName, OrderDate`;
        break;
      case 'byItem':
        sql = `SELECT MenuItemName, 
             SUM(MainOrderMappings.quantity) AS TotalQuantity, 
             SUM(MainOrderMappings.total_price) AS TotalSales 
             FROM MainOrderMappings 
             JOIN MenuItems ON MainOrderMappings.MenuItemId = MenuItems.Id 
             JOIN MainOrders ON MainOrders.MainOrderId = MainOrderMappings.MainOrderId 
             WHERE ${timeCondition} 
             GROUP BY MenuItemName 
             ORDER BY SUM(MainOrderMappings.total_price) DESC`;
        break;
      default:
        throw new Error('Invalid query type');
    }

    try {
      const result = await dbOperations.UseMySQL(sql, "", `执行 ${timeRange} 销售信息 ${queryType} 查询`);
      return result;
    } catch (error) {
      console.error('数据库操作失败:', error);
      throw error;
    }
  },
  /**
   * 生成資料用
   */
  async processGeneratedOrders() {
    const variousMethods = require("./variousMethods.js")

    const orders = variousMethods.getGeneratedOrders(); // 假設這會返回一個訂單陣列

    for (const order of orders) {
      await dbOperations.processOrder(order); // 處理每個訂單
    }
  },

  async processOrder(order) {
    try {
      console.log("開始插入主訂單 : ", order.MainOrderId);
      await this.forTestInsertMainOrder(order);

      console.log("開始插入主訂單的映射 : ", order.MainOrderId);
      await this.insertMainOrderMappings(order.MainOrderId, order.OrderMappings);

      console.log("訂單處理完成:", order.MainOrderId);
    } catch (error) {
      console.error("處理訂單時出錯:", error);
    }
  },
  async forTestInsertMainOrder(order) {
    const sql = `
      INSERT INTO MainOrders (MainOrderId, SubTotal, ServiceFee, Total, TableId, OrderStatus, CreateTime)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const values = [
      order.MainOrderId,
      order.SubTotal,
      order.ServiceFee,
      order.Total,
      order.TableId,
      order.OrderStatus,
      order.CreateTime
    ];
    await dbOperations.UseMySQL(sql, values, "插入主訂單");
  },

};

(async () => {
  try {
    await dbOperations.useDatabase(CURRENT_MYSQL_DATABASE);
  } catch (error) {
    await dbOperations.createDatabase(CURRENT_MYSQL_DATABASE);
    await dbOperations.useDatabase(CURRENT_MYSQL_DATABASE);
  }
  // console.log(pool)

})();


module.exports = dbOperations;