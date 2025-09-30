import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONN_LIMIT || '10', 10),
  namedPlaceholders: true
});

export default {
  query: (sql, params) => pool.execute(sql, params),
  getConnection: () => pool.getConnection()
};
