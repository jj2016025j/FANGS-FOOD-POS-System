const mysql = require('mysql');
const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

connection.connect(err => {
  if (err) {
    return console.error('error: ' + err.message);
  }

  console.log('Connected to the MySQL server.');

  const createDBAndTables = `
    CREATE DATABASE IF NOT EXISTS googledb;
    USE googledb;
    
    CREATE TABLE IF NOT EXISTS users (
      id INT(11) NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      googleID VARCHAR(255) DEFAULT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      thumbnail VARCHAR(255) DEFAULT 'https://img.league-funny.com/imgur/148292128067.jpg',
      email VARCHAR(255) DEFAULT NULL,
      password VARCHAR(1024) DEFAULT NULL,
      lineID VARCHAR(255) DEFAULT NULL,
      reset_token VARCHAR(255) DEFAULT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY email_unique (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    INSERT INTO users (id, name, googleID, date, thumbnail, email, password, lineID, reset_token) VALUES
    (4, 'jq chan', '117319014509002144253', '2024-02-20 16:47:04', 'https://lh3.googleusercontent.com/a/ACg8ocLeS_ytsSXsmzklVUvTYT-Iu75CFybF_7DGR7DqOrV9=s96-c', 'jqchan136309@gmail.com', NULL, NULL, '085748660c0eb03d35a304c1861b6ddaef040a01'),
    (6, '김가은', '111190776991571478286', '2024-02-20 16:52:37', 'https://lh3.googleusercontent.com/a/ACg8ocIFSFmCPuGqkOQD0uwiYOFZCk3hoKk43FzEy2Ym3j-E=s96-c', 's90526905@gmail.com', NULL, NULL, NULL),
    (22, '0319', NULL, '2024-03-19 11:54:25', 'https://img.league-funny.com/imgur/148292128067.jpg', '0319@gmail.com', '$2b$12$WNx/bR40CQqbHDpKvpEL/ubMFZVZC/.oprtwyvk0pqKwLrpq5DUdO', NULL, NULL),
    ...
    (27, '0322', NULL, '2024-03-22 10:04:00', 'https://img.league-funny.com/imgur/148292128067.jpg', '0322@gmail.com', '$2b$12$jRFB1z4NplVD7VkvMVsZNupzzFfZco76McB1U4AFkWToD4bLEiYZ2', NULL, NULL);
  `;

  connection.query(createDBAndTables, (err, results) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Database and table created, and initial data inserted');
  });

  connection.end(err => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Closed the database connection.');
  });
});
