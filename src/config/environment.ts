require("dotenv").config();
module.exports = {
  development: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456a@",
    database: process.env.DB_NAME || "tacn",
    db_port: process.env.DB_PORT || 3306,
    port: process.env.PORT,
  },
  test: {
    port: 3000,
  },
  production: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    db_port: process.env.DB_PORT,
    port: process.env.PORT,
  },
};
