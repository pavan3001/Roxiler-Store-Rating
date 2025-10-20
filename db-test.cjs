const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'caboose.proxy.rlwy.net',
      port: Number(process.env.DB_PORT) || 38197,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'tlQmcZoqDweZpBESsUlAPIZdFgbIhlPC',
      database: process.env.DB_NAME || 'railway',
      connectTimeout: 5000
    });
    const [rows] = await conn.query('SELECT 1 AS ok');
    console.log('Connected — DB responded:', rows);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('DB connection failed:', err.message || err);
    process.exit(1);
  }
})();