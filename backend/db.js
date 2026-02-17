const mysql = require("mysql2/promise");

// pool = conexiones reutilizables (mejor que crear una conexión cada vez)
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "legos_avril",
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;