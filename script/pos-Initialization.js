require('dotenv').config()
var mysql = require('mysql');

//CREATE DATABASE restaurant_order CHARACTER SET utf8 COLLATE utf8_general_ci;

// Create MySQL connection
const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

// Connect to MySQL
connection.connect((err) => {
    // console.log(process);
    console.log(process.env);

    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// // Create migration table if it doesn't exist
// const createMigrationTable = () => {
//     const query = `
//         CREATE TABLE IF NOT EXISTS migrations (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             name VARCHAR(255) NOT NULL UNIQUE,
//             executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//         )
//     `;
//     connection.query(query, (err) => {
//         if (err) {
//             console.error('Error creating migration table:', err);
//         }
//     });
// };


// // Run migration
// const runMigration = (migrationName, migrationQuery) => {
//     const query = `
//         INSERT INTO migrations (name) VALUES ('${migrationName}')
//     `;
//     connection.query(query, (err) => {
//         if (err) {
//             if (err.code !== 'ER_DUP_ENTRY') {
//                 console.error('Error running migration:', err);
//             }
//         } else {
//             console.log(`Migration '${migrationName}' executed successfully`);
//             connection.query(migrationQuery, (err) => {
//                 if (err) {
//                     console.error('Error running migration query:', err);
//                 }
//             });
//         }
//     });
// };

// createMigrationTable();
// runMigration('create_foods_category_table', `
//     CREATE TABLE IF NOT EXISTS foods_category (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         category VARCHAR(255) NOT NULL,
//         sort INT DEFAULT 0
//     )
// `);
// runMigration('create_foods_table', `
//     CREATE TABLE IF NOT EXISTS foods (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         category_id INT NOT NULL,
//         price INT NOT NULL,
//         image_url TEXT NULL,
//         sort INT DEFAULT 0
//     )
// `);
// runMigration('create_foods_table', `
//     CREATE TABLE IF NOT EXISTS foods (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         category_id INT NOT NULL,
//         price INT NOT NULL,
//         image_url TEXT NULL,
//         sort INT DEFAULT 0
//     )
// `);
// runMigration('create_table_orders_table', `
//     CREATE TABLE IF NOT EXISTS table_orders (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         trade_no VARCHAR(255) NOT NULL,
//         food_price INT NULL,
//         service_fee INT NULL,
//         trade_amt INT NULL,
//         table_number INT NOT NULL,
//         order_status TINYINT DEFAULT 1,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         payment_at TIMESTAMP NULL
//     )
// `);
// runMigration('create_orders_items_table', `
//     CREATE TABLE IF NOT EXISTS orders_items (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         order_id INT NOT NULL,
//         food_id INT NOT NULL,
//         quantity INT NOT NULL,
//         unit_price INT NOT NULL,
//         total_price INT NOT NULL
//     )
// `);
// runMigration('insert_food_categories', `
//     INSERT INTO foods_category (category, sort) VALUES 
//     ('鍋類', 1), 
//     ('肉類', 2), 
//     ('海鮮類', 3), 
//     ('蔬菜類', 4), 
//     ('火鍋餃類', 5)
// `);
// runMigration('add_delete_at_to_foods', `
//     ALTER TABLE foods ADD COLUMN deleted_at TIMESTAMP NULL
// `);
// // process.exit(1);

