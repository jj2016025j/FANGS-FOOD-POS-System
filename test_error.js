// 有空再來研究

async function generateSalesReport(type, startDate, endDate = new Date()) {
    let sql = '';

    switch (type) {
      case 'daily':
        sql = `SELECT DATE(CreateTime) AS Date, COUNT(*) AS TotalOrders, SUM(Total) AS TotalSales, AVG(Total) AS AverageSale FROM MainOrders WHERE CreateTime BETWEEN '${startDate}' AND '${endDate}' GROUP BY Date ORDER BY Date;`;
        break;
      case 'hourly':
        sql = `SELECT HOUR(CreateTime) AS Hour, SUM(Total) AS TotalSales, COUNT(*) AS TotalOrders FROM MainOrders WHERE DATE(CreateTime) = '${startDate}' GROUP BY Hour ORDER BY Hour;`;
        break;
      case 'monthly':
        sql = `SELECT DATE_FORMAT(CreateTime, '%Y-%m') AS Month, SUM(Total) AS TotalSales FROM MainOrders GROUP BY Month ORDER BY Month;`;
        break;
      default:
        throw new Error('Unsupported report type');
    }

    return await dbOperations.UseMySQL(sql);
  }
  async function generateMenuItemSalesReport(order = 'DESC', limit = 10) {
    const sql = `SELECT MenuItemId, MenuItems.MenuItemName, SUM(quantity) AS TotalQuantitySold, SUM(total_price) AS TotalRevenue FROM MainOrderMappings JOIN MenuItems ON MainOrderMappings.MenuItemId = MenuItems.Id GROUP BY MenuItemId ORDER BY TotalQuantitySold ${order} LIMIT ${limit};`;

    return await dbOperations.UseMySQL(sql);
  }
  async function generateCategorySalesReport() {
    const sql = `SELECT Category.Id AS CategoryId, Category.CategoryName, SUM(MainOrderMappings.quantity) AS TotalQuantity, SUM(MainOrderMappings.total_price) AS TotalSales FROM MainOrderMappings JOIN MenuItems ON MainOrderMappings.MenuItemId = MenuItems.Id JOIN Category ON MenuItems.CategoryId = Category.Id GROUP BY CategoryId ORDER BY TotalSales DESC;`;

    return await dbOperations.UseMySQL(sql);
  }
  const monthlyReport = await generateSalesReport('monthly', '2020-01-01', '2024-03-31');
  const dailyReport = await generateSalesReport('daily', '2020-01-01');
  const hourlyReport = await generateSalesReport('hourly', '2020-01-01');
  console.log(monthlyReport);
  console.log(dailyReport);
  console.log(hourlyReport);









  /**
   * 根据给定的时间范围和分类动态生成销售报告
   * @param {Date} startDate - 开始日期
   * @param {Date} endDate - 结束日期
   * @param {String} categoryType - 分类类型（'all', 'category', 'item'）
   * @param {Array} categoryIds - 类别或品项的ID数组
   * @returns {Array} 格式化的销售报告数组
   */
  async function generateDynamicSalesReport(startDate, endDate, categoryType = 'all', categoryIds = []) {
    // 确定时间间隔
    const interval = determineTimeInterval(startDate, endDate);

    // 构建基础SQL查询，根据时间间隔聚合
    let baseSql = `
    SELECT 
      ${generateTimeGroupClause(interval)} AS time,
      SUM(quantity) AS totalQuantity,
      SUM(total_price) AS totalPrice
    FROM MainOrderMappings
    JOIN MenuItems ON MainOrderMappings.MenuItemId = MenuItems.Id
  `;

    // 添加分类筛选
    if (categoryType === 'category') {
      baseSql += ` WHERE MenuItems.CategoryId IN (${categoryIds.join(',')})`;
    } else if (categoryType === 'item') {
      baseSql += ` WHERE MenuItems.Id IN (${categoryIds.join(',')})`;
    }

    // 添加时间范围和分组条件
    baseSql += `
  AND CreateTime BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'
    GROUP BY time
    ORDER BY time;
  `;

    // 执行查询并返回结果
    return await dbOperations.UseMySQL(baseSql).then(results =>
      results.map(row => ({
        time: row.time,
        totalPrice: row.totalPrice,
        totalQuantity: row.totalQuantity
      }))
    );
  }

  /**
   * 确定基于给定的开始和结束日期应该使用的时间间隔
   * @param {Date} startDate - 开始日期
   * @param {Date} endDate - 结束日期
   * @returns {String} 间隔类型（'HOUR', 'DAY', 'MONTH', 'YEAR'）
   */
  function determineTimeInterval(startDate, endDate) {
    const diffMs = endDate - startDate;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays <= 1) {
      return 'HOUR';
    } else if (diffDays <= 7) {
      return 'DAY';
    } else if (diffDays <= 30) {
      return 'DAY';
    } else if (diffDays <= 90) {
      return 'MONTH';
    } else if (diffDays <= 180) {
      return 'MONTH';
    } else {
      return 'YEAR';
    }
  }

  /**
   * 生成SQL中的时间聚合子句
   * @param {String} interval - 间隔类型
   * @returns {String} SQL聚合子句
   */
  function generateTimeGroupClause(interval) {
    switch (interval) {
      case 'HOUR': return "DATE_FORMAT(CreateTime, '%Y-%m-%d %H:00')";
      case 'DAY': return "DATE_FORMAT(CreateTime, '%Y-%m-%d')";
      case 'MONTH': return "DATE_FORMAT(CreateTime, '%Y-%m')";
      case 'YEAR': return "DATE_FORMAT(CreateTime, '%Y')";
      default: return "DATE_FORMAT(CreateTime, '%Y-%m-%d')";
    }
  }

  // 假设今天是2024年3月31日
  const startDate = new Date('2024-03-30');
  const endDate = new Date('2024-03-31');

  await generateDynamicSalesReport(startDate, endDate, 'all', []).then(report => {
    console.log("近一天每小时的销量及销售额:", report);
    console.log(report);
  });

  // 假设今天是2024年3月31日，我们想要获取从3月24日到3月31日的数据
  const startDate2 = new Date('2024-03-24');
  const endDate2 = new Date('2024-03-31');

  await generateDynamicSalesReport(startDate2, endDate2, 'all', []).then(report => {
    console.log("近一周每天的销量及销售额:", report);
    console.log(report);
  });

  const startDate3 = new Date('2024-01-01');
  const endDate3 = new Date('2024-03-31');

  // 假设肉类的CategoryId是2
  await generateDynamicSalesReport(startDate3, endDate3, 'category', [2]).then(report => {
    console.log("今年至今肉类的销量及销售额:", report);
    console.log(report);
  });

  async function generateDynamicSalesReport(startDate, endDate, categoryType = 'all', categoryIds = []) {
    const interval = determineTimeInterval(startDate, endDate);
    let whereClause = `CreateTime BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'`;

    if (categoryType === 'category') {
      whereClause += ` AND CategoryId IN (${categoryIds.join(',')})`;
    } else if (categoryType === 'item') {
      whereClause += ` AND MenuItemId IN (${categoryIds.join(',')})`;
    }

    const timeGroupClause = generateTimeGroupClause(interval);
    let baseSql = `
      SELECT 
        ${timeGroupClause} AS time,
        SUM(quantity) AS totalQuantity,
        SUM(total_price) AS totalPrice
      FROM MainOrderMappings
      JOIN MenuItems ON MainOrderMappings.MenuItemId = MenuItems.Id
      WHERE ${whereClause}
      GROUP BY time
      ORDER BY time;
    `;

    return await dbOperations.UseMySQL(baseSql).then(results =>
      results.map(row => ({
        time: row.time,
        totalPrice: parseFloat(row.totalPrice),
        totalQuantity: parseInt(row.totalQuantity, 10)
      }))
    );
  }

  const startDate = new Date('2024-03-30');
  const endDate = new Date('2024-03-31');

  await generateDynamicSalesReport(startDate, endDate, 'all', []).then(report => {
    console.log("近一天每小时的销量及销售额:", report);
  });


// 有空再來研究F