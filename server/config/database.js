import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'roxiler_store_rating',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Initialize database and tables
const initializeDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.end();

    // Create tables
    await createTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

const createTables = async () => {
  const connection = await pool.getConnection();
  
  try {
    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address TEXT,
        role ENUM('admin', 'user', 'store_owner') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Stores table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        address TEXT NOT NULL,
        owner_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Ratings table
    // Create ratings table with rater_name column if it does not exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        rater_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_store_rating (user_id, store_id)
      )
    `);

    // Create default admin user
    try {
      const [adminExists] = await connection.execute(
        'SELECT id FROM users WHERE email = ? AND role = ?',
        ['admin@roxiler.com', 'admin']
      );
      if (adminExists.length === 0) {
        await connection.execute(`
          INSERT INTO users (name, email, password, address, role)
          VALUES (?, ?, ?, ?, ?)
        `, [
          'System Administrator',
          'admin@roxiler.com',
          'Admin@123',
          'System Admin Address',
          'admin'
        ]);
        console.log('Default admin user created: admin@roxiler.com / Admin@123');
      } else {
        console.log('Default admin user already exists. Skipping creation.');
      }
    } catch (err) {
      console.error('Error creating default admin user:', err.message);
    }

    // Seed sample users if none exist (excluding admin)
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    if (userCount[0].count === 0) {
      await connection.execute(`
        INSERT INTO users (name, email, password, address, role)
        VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)
      `, [
        'John Doe', 'john@example.com', 'User@123', '123 Main St', 'user',
        'Jane Smith', 'jane@example.com', 'User@123', '456 Oak Ave', 'user'
      ]);
      console.log('Sample users created.');
    }

    // Seed sample store owners if none exist
    const [ownerCount] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE role = "store_owner"');
    if (ownerCount[0].count === 0) {
      await connection.execute(`
        INSERT INTO users (name, email, password, address, role)
        VALUES (?, ?, ?, ?, ?)
      `, [
        'Store Owner', 'owner@example.com', 'Owner@123', '789 Pine Rd', 'store_owner'
      ]);
      console.log('Sample store owner created.');
    }

    // Seed sample stores if none exist
    const [storeCount] = await connection.execute('SELECT COUNT(*) as count FROM stores');
    if (storeCount[0].count === 0) {
      // Get owner id
      const [owners] = await connection.execute('SELECT id FROM users WHERE role = "store_owner" LIMIT 1');
      const ownerId = owners.length > 0 ? owners[0].id : null;
      if (ownerId) {
        await connection.execute(`
          INSERT INTO stores (name, email, address, owner_id)
          VALUES (?, ?, ?, ?), (?, ?, ?, ?)
        `, [
          'SuperMart', 'supermart@example.com', 'Market Street', ownerId,
          'TechStore', 'techstore@example.com', 'Tech Avenue', ownerId
        ]);
        console.log('Sample stores created.');
      }
    }

    // Seed sample ratings if none exist
    const [ratingCount] = await connection.execute('SELECT COUNT(*) as count FROM ratings');
    if (ratingCount[0].count === 0) {
      // Get user and store ids
      const [users] = await connection.execute('SELECT id, name FROM users WHERE role = "user"');
      const [stores] = await connection.execute('SELECT id, name FROM stores');
      if (users.length > 0 && stores.length > 0) {
        // Insert ratings for each user on each store
        for (const user of users) {
          for (const store of stores) {
            await connection.execute(
              'INSERT INTO ratings (user_id, store_id, rating, rater_name) VALUES (?, ?, ?, ?)',
              [user.id, store.id, Math.floor(Math.random() * 5) + 1, user.name]
            );
          }
        }
        console.log('Sample ratings created.');
      }
    }

  } finally {
    connection.release();
  }
};

export { pool, initializeDatabase };