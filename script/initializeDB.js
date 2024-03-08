// 確認是否有資料表
// 若無則建立資料表
// 確認是否有資料庫
// 若無則建立資料庫


const dbOperations = require('./mynodesql.js');

dbOperations.createDatabase('fangs_food_pos_system');
dbOperations.useDatabase('fangs_food_pos_system');
dbOperations.createTable(`
    CREATE TABLE IF NOT EXISTS Categories (
    CategoryId INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(255) NOT NULL,
    Description TEXT)
    `)
dbOperations.createTable(`
    CREATE TABLE IF NOT EXISTS MenuItems (
    MenuItemId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    Price DECIMAL(10, 2) NOT NULL,
    CategoryId INT,
    Insupply BOOLEAN DEFAULT TRUE,
    CreateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId)
  )`)

const CategoryTable={
    CategoryName: "Name",
    CategoryDescription: "CategoryDescription"
};
dbOperations.insertIntoDataToTable(
    `INSERT INTO Categories 
    (CategoryName, Description) 
    VALUES (?, ?)`,
    [CategoryTable.CategoryName,
        CategoryTable.CategoryDescription])

const Items = {
    MenuItemId: 20,
    Name: "Name",
    Description: "Description",
    Price: 0.33,
    CategoryId: 2,
    Insupply: true
};

// 
dbOperations.insertIntoMenuItems(Items)
dbOperations.updateMenuItems(Items)
// 表名稱 列名稱 列值
// dbOperations.updateFormTable("MenuItems", "MenuItemId", 1)
dbOperations.updateFromTable(
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
dbOperations.deleteFromTable("MenuItems", "MenuItemId", 9)
// dbOperations.selectFromTable("MenuItemId, Name, Description, Price, CategoryId, InSupply","MenuItems")
dbOperations.closeConnection()
