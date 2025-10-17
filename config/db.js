const mysql = require("mysql2");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 10,
  ssl: {
    ca: fs.readFileSync(process.env.DB_CA_PATH),
  },
});
db.getConnection((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    return;
  }
  console.log("Connected to MySQL database");
});

module.exports = db;
