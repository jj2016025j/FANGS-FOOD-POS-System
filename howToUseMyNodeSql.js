const pool = require("./mynodesql.js")

require('dotenv').config();

const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;
const TEST_MYSQL_DATABASE = process.env.TEST_MYSQL_DATABASE;
const TEST_MYSQL_DATABASE2 = process.env.TEST_MYSQL_DATABASE2;

// 创建数据库
async function initializeDatabase() {
  await pool.createDatabase(TEST_MYSQL_DATABASE2);
}

async function useDatabase() {
  await pool.useDatabase(TEST_MYSQL_DATABASE2);
}

// 使用 UseMySQL 方法创建数据表
async function createTestTable() {
  await pool.UseMySQL(
    `CREATE TABLE IF NOT EXISTS Test (
        Id INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(255) NOT NULL,
        Description TEXT NULL
      )`
  );
}

async function initializeTables() {
  const usersTableDefinition = `
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `;
  await pool.createTable('users', usersTableDefinition);
}

// 插入数据
async function addNewUser() {
  const newUser = {
    username: 'john_doe',
    email: 'john2@example.com',
    password: 'hashed_password'
  };
    const result = await pool.insert('users', newUser);
}

// 更新数据
async function updateUser(userId) {
  const updates = {
    email: 'new_email@example.com'
  };
  const conditions = { id: userId };
  try {
    const result = await pool.update('users', updates, conditions);
    console.log('用户更新成功:', result);
  } catch (error) {
    console.error('更新用户失败:', error);
  }
}

// 删除数据
async function deleteUser(userId) {
  try {
    const result = await pool.delete('users', { id: userId });
    console.log('用户删除成功:', result);
  } catch (error) {
    console.error('删除用户失败:', error);
  }
}

// 选择数据
async function getUserByEmail(email) {
  try {
    const users = await pool.select('users', '*', { email: email });
    if (users.length) {
      console.log('找到用户:', users[0]);
    } else {
      console.log('未找到用户');
    }
  } catch (error) {
    console.error('查询用户失败:', error);
  }
}

async function closeConnection() {
  try {
    pool.closeConnection();
    console.log('已關閉資料庫');
  } catch (error) {
    console.error('關閉資料庫失敗:', error);
  }
}

(async () => {
  await initializeDatabase();
  await useDatabase();
  await initializeTables();
  await createTestTable();
  await addNewUser();
  await updateUser(1)
  await deleteUser(1)
  await getUserByEmail('john@example.com');
  await closeConnection()
})();