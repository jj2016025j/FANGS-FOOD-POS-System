const dbOperations = require("./pos_mysql.js")
require('dotenv').config();

const TEST_MYSQL_DATABASE = process.env.TEST_MYSQL_DATABASE;

(async () => {
  // 如果要重建資料庫就保留這個功能 重建後再備註
  await dbOperations.dropDatabase(TEST_MYSQL_DATABASE)

  await dbOperations.createDatabase(TEST_MYSQL_DATABASE)
  await dbOperations.useDatabase(TEST_MYSQL_DATABASE)

  const tableDefinition = `
    Id INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(255) NOT NULL,
    Description TEXT NULL,
    sort INT DEFAULT 0
  `;
  await dbOperations.createTable('Category', tableDefinition);

  // 傳入分類
  await dbOperations.UseMySQL(
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

  const TablesTableDefinition = `
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TableNumber INT NOT NULL,
    TablesStatus ENUM('空桌', '點餐中', '待確認', '製作中', '用餐中', '清潔中') NOT NULL DEFAULT '空桌',
    MainOrderId VARCHAR(255) NULL
  `;

  await dbOperations.createTable('Tables', TablesTableDefinition);

  await dbOperations.initTable(20)

  await dbOperations.editTableStatus(1, "空桌")
  await dbOperations.editTableStatus(2, "點餐中")
  await dbOperations.editTableStatus(3, "待確認")
  await dbOperations.editTableStatus(4, "製作中")
  await dbOperations.editTableStatus(5, "用餐中")
  await dbOperations.editTableStatus(6, "清潔中")

  // 食物
  await dbOperations.UseMySQL(
    `CREATE TABLE IF NOT EXISTS MenuItems (
      Id INT AUTO_INCREMENT PRIMARY KEY,
      MenuItemName VARCHAR(255) NOT NULL,
      CategoryId INT NOT NULL,
      Price INT NOT NULL,
      image_url TEXT NULL,
      Insupply BOOLEAN DEFAULT TRUE,
      CreateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UpdateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (CategoryId) REFERENCES Category(Id) ON DELETE CASCADE,
      sort INT DEFAULT 0);
    `
    , "", "建立 MenuItems 資料表")

  const itemData = require("./script/data/fangsFoodData.js")
  await dbOperations.insertMenuItemsData(itemData, categoryMap)

  // 主訂單
  await dbOperations.UseMySQL(
    `CREATE TABLE IF NOT EXISTS MainOrders (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  MainOrderId VARCHAR(255) NOT NULL,
  SubTotal INT DEFAULT 0,
  ServiceFee INT DEFAULT 0,
  Total INT DEFAULT 0,
  TableId INT NOT NULL,
  OrderStatus ENUM('未結帳', '以結帳', '已取消') NOT NULL DEFAULT '未結帳',
  CreateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UserId INT,
  FOREIGN KEY (TableId) REFERENCES Tables(Id)
  )`
    , "", "建立 MainOrders 資料表")

  const MainOrderId = await dbOperations.generateMainOrderId()
  console.log(`生成新主訂單 ${MainOrderId}`)

  await dbOperations.makeNewMainOrder(MainOrderId)

  await dbOperations.editMainOrderStatus(MainOrderId, "已結帳")
  await dbOperations.editMainOrderStatus(MainOrderId, "未結帳")
  await dbOperations.editMainOrderStatus(MainOrderId, "已取消")

  await dbOperations.UseMySQL(
    `CREATE TABLE IF NOT EXISTS MainOrderMappings (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    MainOrderId VARCHAR(255) NOT NULL,
    MenuItemId INT NOT NULL,
    quantity INT NOT NULL,
    unit_price INT NOT NULL,
    total_price INT NOT NULL,
    -- FOREIGN KEY (MainOrderId) REFERENCES MainOrders(Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MenuItemId) REFERENCES MenuItems(Id) ON DELETE CASCADE ON UPDATE CASCADE);
  `, "", "建立 主訂單與品項 對照資料表")

  // 子訂單
  await dbOperations.UseMySQL(
    `CREATE TABLE IF NOT EXISTS SubOrders (
      Id INT AUTO_INCREMENT PRIMARY KEY,
      SubOrderId VARCHAR(255) NOT NULL,
      MainOrderId VARCHAR(255) NOT NULL,
      SubTotal INT DEFAULT 0,
      TableId INT NOT NULL,
      OrderStatus ENUM('未製作', '製作中', '已完成', '已取消') NOT NULL DEFAULT '未製作',
      CreateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UpdateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      -- ,FOREIGN KEY (MainOrderId) REFERENCES MainOrders(Id) ON DELETE CASCADE
    )`
    , "", "建立 子訂單 資料表")

  const SubOrderId = await dbOperations.generateSubOrderId(MainOrderId)
  console.log(`生成新子訂單 ${SubOrderId}`)

  await dbOperations.makeNewSubOrder(MainOrderId, SubOrderId)

  await dbOperations.editSubOrderStatus(SubOrderId, "製作中")
  await dbOperations.editSubOrderStatus(SubOrderId, "已完成")
  await dbOperations.editSubOrderStatus(SubOrderId, "未製作")
  await dbOperations.editSubOrderStatus(SubOrderId, "已取消")

  await dbOperations.UseMySQL(
    `CREATE TABLE IF NOT EXISTS SubOrderMappings (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    SubOrderId VARCHAR(255) NOT NULL,
    MenuItemId INT NOT NULL,
    quantity INT NOT NULL,
    unit_price INT NOT NULL,
    total_price INT NOT NULL,
    -- FOREIGN KEY (SubOrderId) REFERENCES SubOrders(Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MenuItemId) REFERENCES MenuItems(Id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `, "", "建立 子訂單與品項 對照資料表")

  const SubOrderInfo = [
    {
      "MenuItemId": 1,
      "quantity": 4,
    },
    {
      "MenuItemId": 2,
      "quantity": 3,
    }
  ]

  await dbOperations.sendSubOrder(SubOrderId, SubOrderInfo)

  // 處理並提交新子訂單映射的函式
  async function makeNewSubOrderMappings(MainOrderId, SubOrderId, SubOrderInfo) {
    let subOrderTotal = 0;

    for (const item of SubOrderInfo) {
      const MenuItemInfo = await dbOperations.fetchMenuItemInfo(item.MenuItemId);
      if (Array.isArray(MenuItemInfo) && MenuItemInfo.length > 0) {
        const unit_price = MenuItemInfo[0].Price;
        const total_price = item.quantity * unit_price;
        subOrderTotal += total_price;
        await dbOperations.processSubOrderMappings(SubOrderId, item, unit_price, total_price);
        await dbOperations.updateMainOrderMappings(MainOrderId, item, item.quantity, unit_price, total_price);
      } else {
        console.error(`品項 ${item.MenuItemId} 不存在`);
      }
    }

    await dbOperations.updateSubOrderTotal(SubOrderId, subOrderTotal);
    await verifyTotals(MainOrderId, subOrderTotal);
  }

  // 驗證總額是否匹配的函式
  async function verifyTotals(MainOrderId) {
    const totalFromMappings = await dbOperations.calculateTotalFromMainOrderMappings(MainOrderId);
    const totalFromSubOrders = await dbOperations.calculateMainOrderTotal(MainOrderId);

    // 直接比較計算得出的總額。之前的方法可能不會準確反映即時更改，除非進行額外的步驟將新總額更新到數據庫中，這似乎是缺失的。
    if (totalFromMappings === totalFromSubOrders) {
      console.log(`主訂單 ${MainOrderId} 的總額驗證成功，數據一致。`);
    } else {
      console.error(`主訂單 ${MainOrderId} 的總額驗證失敗，數據不一致。`);
    }
  }

  await dbOperations.UseMySQL(
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

  //監控 
  await dbOperations.UseMySQL(
    `CREATE TABLE table_operations_log (
    id BIGINT NOT NULL AUTO_INCREMENT,
    table_name VARCHAR(64) NOT NULL,
    operation ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    operation_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user VARCHAR(64) DEFAULT NULL,
    record_id VARCHAR(255) DEFAULT NULL,
    before_value TEXT,
    after_value TEXT,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `, "", "建立 log 資料表")

  await dbOperations.processGeneratedOrders().then(() => {
    console.log('所有訂單已處理完畢');
  }).catch(error => {
    console.error('處理訂單過程中發生錯誤:', error);
  });
















  /**
 * 生成SQL查詢的時間條件
 * @param {string} timeRange - 時間範圍
 * @returns {string} SQL的時間條件
 */
  function generateTimeCondition(timeRange, tableName = 'MainOrders') {
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
  }

  async function getBackEndData(timeRange, queryType, groupByTime = '') {
    const timeCondition = generateTimeCondition(timeRange, 'MainOrders');

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
      const result = await dbOperations.UseMySQL(sql, "", "执行销售信息查询");
      return result;
    } catch (error) {
      console.error('数据库操作失败:', error);
      throw error;
    }
  }

  // 查询过去一个月内按品项的销售信息
  await getBackEndData('lastMonth', 'byItem')
    .then(console.log)
    .catch(console.error);

  // 查询过去一周内按分类每天的销售信息
  // 注意：这里需要根据实际情况提供SQL语句的具体实现
  await getBackEndData('lastWeek', 'byCategory', 'day')
    .then(console.log)
    .catch(console.error);

  // 查询所有时间内每月的总销售信息（全部订单）
  // 注意：这里需要根据实际情况提供SQL语句的具体实现
  await getBackEndData('all', 'all', 'month')
    .then(console.log)
    .catch(console.error);

  await dbOperations.closeConnection()
})()

// await dbOperations.UseMySQL(
//   `CREATE TABLE IF NOT EXISTS Roles (
//     Role VARCHAR(50),
//     RoleId INT AUTO_INCREMENT PRIMARY KEY,
//     ValidUntil TIMESTAMP
//   );`)

// await dbOperations.UseMySQL(
//   `CREATE TABLE IF NOT EXISTS Pages (
//     PageId INT AUTO_INCREMENT PRIMARY KEY,
//     PageName VARCHAR(255) NOT NULL,
//     RoleRequired VARCHAR(50) NOT NULL
//   );`)
