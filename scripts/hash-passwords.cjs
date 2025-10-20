const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [rows] = await conn.query('SELECT id, email, password FROM users');
    for (const row of rows) {
      const pw = row.password || '';
      if (!pw.startsWith('$2')) { // naive check for bcrypt hash
        const hashed = await bcrypt.hash(pw, 10);
        await conn.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, row.id]);
        console.log(`Hashed password for ${row.email}`);
      } else {
        console.log(`Already hashed: ${row.email}`);
      }
    }

    await conn.end();
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
