require('dotenv').config()
const mysql = require('mysql');
const fs = require('fs');
const path = require('path')
const mime = require('mime-types');
const moment = require('moment');

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: true,
    charset: "utf8mb4", // 確保使用 utf8mb4
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Repository functions
const repository = {
    getPool: () => { return pool },
    /**
     * 取得報表
     * 1.本日營業額: dayTurnover
     * 2.本月營業額: monthTurnover
     * 3.本月銷售排行榜前五名: rankTop5
     * 4.前12個月份的營業額: monthTurnoverOfYear
     */
    getReport: () => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                var m12_start = moment().startOf('month').subtract(12, 'months').format('YYYY-MM-DD 00:00:00');
                var m12_end = moment().endOf('month').format('YYYY-MM-DD 23:59:59');
                var dayTurnoverSql = `SELECT SUM(trade_amt) as trade_amt FROM table_orders WHERE DATE(payment_at) = CURDATE() AND order_status = 2`;
                var monthTurnoverSql = `SELECT SUM(trade_amt) as trade_amt FROM table_orders WHERE MONTH(payment_at) = MONTH(CURDATE()) AND YEAR(payment_at) = YEAR(CURDATE()) AND order_status = 2`;
                var rankTop5Sql = `SELECT food_id, SUM(quantity) as total FROM orders_items oi LEFT JOIN table_orders o ON o.id = oi.order_id WHERE o.order_status = 2 AND YEAR(payment_at) = YEAR(CURDATE()) AND MONTH(payment_at) = MONTH(CURDATE()) GROUP BY food_id ORDER BY total DESC LIMIT 5`;
                var monthTurnoverOfYearSql = `SELECT YEAR(payment_at) as year, MONTH(payment_at) as month, SUM(trade_amt) as price FROM table_orders WHERE (payment_at BETWEEN '${m12_start}' AND '${m12_end}') AND order_status = 2 GROUP BY YEAR(payment_at), MONTH(payment_at)`;
                const oneSql = dayTurnoverSql + ';' + monthTurnoverSql + ';' + rankTop5Sql + ';' + monthTurnoverOfYearSql;

                connection.query(oneSql, (error, results) => {
                    connection.release();
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve({
                        dayTurnover: results[0][0].trade_amt || 0,
                        monthTurnover: results[1][0].trade_amt || 0,
                        rankTop5: results[2],
                        monthTurnoverOfYear: results[3]
                    })
                });
            });
        })
    },
    genearteTradeNo: () => {
        return 'ORD' + Date.now() + Math.random().toString(36).substring(4);
    },
    create: (data, callback) => {
        pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
                return;
            }

            connection.query('INSERT INTO your_table SET ?', data, (error, results) => {
                connection.release();
                if (error) {
                    callback(error);
                    return;
                }

                callback(null, results.insertId);
            });
        });
    },
    // 檢查目標文件夾是否存在，如果不存在則創建
    ensureDirectoryExistence: (filePath) => {
        var dirname = path.dirname(filePath);
        if (fs.existsSync(dirname)) {
            return true;
        }
        repository.ensureDirectoryExistence(dirname);
        fs.mkdirSync(dirname);
    },
    uploadImage: (file, target_dir) => {
        var tmp_path = file.path;
        var image_name = Date.now() + '_' + Math.random().toString(36).substring(7) + '.' + mime.extension(file.mimetype);
        var target_path = path.join(target_dir, image_name);
        repository.ensureDirectoryExistence(target_path); // 確保目標文件夾存在
        fs.rename(tmp_path, target_path, function (err) {
            if (err) throw err; // 如果有錯誤，拋出以便處理
        });
        return image_name;
    },
    uploadFood: async (formData, imageFile) => {
        return new Promise((resolve, reject) => {
            const image_name = repository.uploadImage(imageFile, './public/uploads/foods');
            const image_path = '/uploads/foods/' + image_name;
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                connection.query('INSERT INTO foods (name, price, category_id, image_url) VALUES(?,?,?,?)', [
                    formData['item-name'],
                    formData['item-price'],
                    formData['select-type'],
                    image_path
                ], (error, results) => {
                    connection.release();
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results)
                });
            });
        })
    },
    editFood: async (id, formData, imageFile) => {
        return new Promise((resolve, reject) => {
            var image_path = '';
            if (imageFile) {
                const image_name = repository.uploadImage(imageFile, './public/uploads/foods');
                image_path = '/uploads/foods/' + image_name;
            }

            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                var sqlStr = `UPDATE foods SET name = ?, price = ?, category_id = ?`;
                var values = [formData['item-name'], formData['item-price'], formData['select-type']];
                if (image_path) {
                    sqlStr += `, image_url = ?`;
                    values.push(image_path)
                }
                sqlStr += ` WHERE id = ?`;
                values.push(id);

                connection.query(sqlStr, values, (error, results) => {
                    connection.release();
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results)
                });
            });
        })
    },
    //僅可刪除尚未結帳訂單之食材
    deleteOrderFood: async (orderId, foodId) => {
        return new Promise((resolve, reject) => {
            pool.getConnection(async (err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                var order = await repository.getOrderById(orderId)
                if (!order || order.order_status != 1) {
                    reject('此訂單已結帳或不存在')
                    return;
                }
                connection.query(`DELETE FROM orders_items where order_id = ? AND food_id = ?`, [orderId, foodId], (error, results) => {
                    connection.release();
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results)
                });
            });
        })
    },
    deleteFood: async (id) => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                connection.query('UPDATE foods SET deleted_at = CURRENT_TIMESTAMP where id = ?', [id], (error, results) => {
                    connection.release();
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results)
                });
            });
        })
    },
    getFoodsWithTrash: async () => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                connection.query('SELECT * FROM foods', (error, results) => {
                    connection.release();
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results)
                });
            });
        })
    },
    getFoods: async () => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                connection.query('SELECT * FROM foods where deleted_at IS NULL', (error, results) => {
                    connection.release();
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results)
                });
            });
        })
    },
    getFoodCateories: async () => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                connection.query('SELECT * FROM foods_category ORDER BY sort ASC', (error, results) => {
                    connection.release();
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results)
                });
            });
        })
    },
    //取得訂單ById
    getOrderById: async (id) => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                connection.query('SELECT * FROM table_orders where id = ?', [id], (error, results) => {
                    connection.release();
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results.length ? results[0] : null)
                });
            });
        })
    },
    //取得訂單ById
    getTradeNoById: async (id) => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                connection.query('SELECT trade_no FROM table_orders where id = ?', [id], (error, results) => {
                    connection.release();
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results.length ? results[0] : null)
                });
            });
        })
    },
    //取得訂單ByTradeNo
    getOrderByTradeNo: async (trade_no) => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                connection.query('SELECT * FROM table_orders where trade_no = ?', [trade_no], (error, results) => {
                    connection.release();
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results.length ? results[0] : null)
                });
            });
        })
    },
    //取得用餐中訂單
    getPendingTableOrders: async () => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                connection.query('SELECT * FROM table_orders where order_status = 1', (error, results) => {
                    connection.release();
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results)
                });
            });
        })
    },
    addTableOrder: async (tableNum) => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                connection.query('SELECT * FROM table_orders WHERE order_status = 1 AND table_number = ?', [tableNum], (error, results) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    if (results.length > 0) {
                        reject('此桌號目前已有訂單');
                    } else {
                        connection.query('INSERT INTO table_orders (trade_no, table_number) VALUES(?,?)', [
                            repository.genearteTradeNo(),
                            tableNum
                        ], (error, results) => {
                            connection.release();
                            if (error) {
                                reject(error);
                                return;
                            }
                            resolve(results)
                        });
                    }
                });
            });
        })
    },
    clearOrderFoods: async (orderId) => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                connection.query('DELETE FROM orders_items where order_id = ?', [orderId], (error, results) => {
                    connection.release();
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(true);
                });
            });
        })
    },
    //取得產品品項
    getOrderFoods: async (orderId) => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                connection.query('SELECT * FROM orders_items where order_id = ?', [orderId], (error, results) => {
                    connection.release();
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results)
                });
            });
        })
    },
    /**
     * 疊加產品
     * [{id: food_id, item: 數量}]
     * 先取出後加在一起，全部刪除後，再寫入
     */
    appendOrderFoods: async (orderId, data) => {
        var foods = await repository.getOrderFoods(orderId);
        var newData = data;
        foods.forEach((f) => {
            var index = newData.findIndex((item) => item.id == f.food_id);
            if (index > -1) {
                newData[index].item += f.quantity;
            } else {
                newData.push({ id: f.food_id, item: f.quantity });
            }
        });
        await repository.clearOrderFoods(orderId);
        return await repository.updateOrderFoods(orderId, newData);
    },
    //[{id: food_id, item: 數量}]  
    updateOrderFoods: async (orderId, data) => {
        return new Promise((resolve, reject) => {
            pool.getConnection(async (err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                const foods = await repository.getFoods();
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

                await repository.clearOrderFoods(orderId); //先清除
                connection.query(sqlStr, values, (error, results) => {
                    connection.release();
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(true);
                });
            });
        })
    },
    //完成現金付款
    confirmPaymentByCash: (order_id) => {
        return new Promise(async (resolve, reject) => {
            // // console.log("await ")
            const order = await repository.getOrderById(order_id);
            const order_foods = await repository.getOrderFoods(order_id);
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

                pool.getConnection((err, connection) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    connection.query('UPDATE table_orders SET food_price = ?, service_fee = ?, trade_amt = ?, order_status = ?, payment_at = CURRENT_TIMESTAMP WHERE id = ?', [food_price, service_fee, trade_amt, order_status, order_id], (error, results) => {
                        connection.release();
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(true);
                    });
                });


            } else {
                reject('查無訂單或訂單無品項')
                return
            }
        })

    },
    //計算訂單總價
    calculateOrder: (order_id) => {
        return new Promise(async (resolve, reject) => {
            // // console.log("await ")
            const order = await repository.getOrderById(order_id);
            const order_foods = await repository.getOrderFoods(order_id);
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

                pool.getConnection((err, connection) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    connection.query('UPDATE table_orders SET food_price = ?, service_fee = ?, trade_amt = ? WHERE id = ?', [food_price, service_fee, trade_amt, order_id], (error, results) => {
                        connection.release();
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(true);
                    });
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
            pool.getConnection((error, connection) => {
                if (error) {
                    reject(error);
                    return;
                }
                connection.query(
                    `UPDATE table_orders 
                     SET food_price = ?, 
                     service_fee = ?, 
                     trade_amt = ?, 
                     order_status = ?, 
                     payment_at = CURRENT_TIMESTAMP 
                     WHERE order_status = ?`,
                    [0, 0, 0, 2, 1], (error, results) => {
                        connection.release();
                        if (error) {
                            reject(error);
                            return;
                        }
                        // console.log(results);
                        resolve(results);
                    });
            });
        });
    }

};

module.exports = repository;