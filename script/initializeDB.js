// npm install mysql
// const mysql = require('mysql');
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
// });



const dbOperations = require('./mynodesql.js');

dbOperations.createDatabase('fangs_food_pos_system');
dbOperations.useDatabase('fangs_food_pos_system');
dbOperations.createTable()