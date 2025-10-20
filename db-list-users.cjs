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
      connectTimeout: 10000
    });

    const [rows] = await conn.query('SELECT id, name, email, password, role, created_at FROM users');
    console.log('Users in DB:');
    console.table(rows);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('DB query failed:', err.message || err);
    process.exit(1);
  }
})();
