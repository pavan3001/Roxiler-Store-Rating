// Restore ratings utility (for admin)
const restoreRatings = async (req, res) => {
  try {
    // Example: Insert a sample rating for Demo Store (store_id=1, user_id=2)
    await pool.execute(
      `INSERT INTO ratings (user_id, store_id, rating, rater_name)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), rater_name = VALUES(rater_name)`,
      [2, 1, 3, 'Pavan Kumar Kolipakula']
    );
    res.json({ message: 'Ratings restored or updated successfully.' });
  } catch (error) {
    console.error('Restore ratings error:', error);
    res.status(500).json({ message: 'Failed to restore ratings', error: error.message });
  }
};
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { pool } from '../config/database.js';

const getDashboardStats = async (req, res) => {
  try {
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [storeCount] = await pool.execute('SELECT COUNT(*) as count FROM stores');
    const [ratingCount] = await pool.execute('SELECT COUNT(*) as count FROM ratings');

    res.json({
      totalUsers: userCount[0].count,
      totalStores: storeCount[0].count,
      totalRatings: ratingCount[0].count
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, password, address, role } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Store password as plaintext
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, address, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.insertId,
        name,
        email,
        address,
        role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createStore = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, address, ownerEmail } = req.body;

    // Find owner by email
    let ownerId = null;
    if (ownerEmail) {
      const [owners] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND role = ?',
        [ownerEmail, 'store_owner']
      );
      
      if (owners.length === 0) {
        return res.status(400).json({ message: 'Store owner not found with this email' });
      }
      ownerId = owners[0].id;
    }

    // Check if store already exists
    const [existingStores] = await pool.execute(
      'SELECT id FROM stores WHERE email = ?',
      [email]
    );

    if (existingStores.length > 0) {
      return res.status(400).json({ message: 'Store already exists with this email' });
    }

    // Create store
    const [result] = await pool.execute(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, ownerId]
    );

    res.status(201).json({
      message: 'Store created successfully',
      store: {
        id: result.insertId,
        name,
        email,
        address,
        owner_id: ownerId
      }
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { search, role, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             COALESCE(AVG(r.rating), 0) as rating
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (role) {
      query += ` AND u.role = ?`;
      params.push(role);
    }
    
    query += ` GROUP BY u.id`;
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

    const [users] = await pool.execute(query, params);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getStores = async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'asc', rating } = req.query;
    let havingClause = '';
    const params = [];
    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at, s.owner_id,
             (
               SELECT COALESCE(AVG(r.rating), 0)
               FROM ratings r
               WHERE r.store_id = s.id
             ) as rating,
             (
               SELECT COUNT(r.id)
               FROM ratings r
               WHERE r.store_id = s.id
             ) as total_ratings
      FROM stores s
      WHERE 1=1
    `;
    if (search) {
      query += ` AND (s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    // Filtering by rating (exact match for 5, or minimum for others)
    if (rating) {
      if (rating === '5') {
        havingClause = 'HAVING rating = 5';
      } else {
        havingClause = `HAVING rating >= ?`;
        params.push(Number(rating));
      }
    }
    query += ` ${havingClause}`;
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    const [stores] = await pool.execute(query, params);
    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  // Get all ratings for a store with user info (for admin dashboard)
const getStoreRatings = async (req, res) => {
  const storeId = req.params.id;
    console.log('getStoreRatings called for storeId:', req.params.id);
  try {
    let ratingsRaw = [];
    try {
      [ratingsRaw] = await pool.execute(
        `SELECT r.id, r.rating, r.rater_name, r.created_at,
                u.id as user_id, u.name as user_name, u.email as user_email
         FROM ratings r
         LEFT JOIN users u ON r.user_id = u.id
         WHERE r.store_id = ?
         ORDER BY r.created_at DESC`,
        [storeId]
      );
    } catch (queryErr) {
      console.error('Ratings query error:', queryErr);
      return res.json([]);
    }
      console.log('RatingsRaw:', ratingsRaw);
    if (!Array.isArray(ratingsRaw)) {
      ratingsRaw = [];
    }
    const ratings = ratingsRaw.map(r => {
      return {
        id: r.id,
        rating: r.rating,
        rater_name: r.rater_name || r.user_name || 'Unknown',
        user_name: r.user_name || r.rater_name || 'Unknown',
        user_email: r.user_email || '-',
        created_at: r.created_at,
        comment: null
      };
    }).filter(Boolean);
      console.log('Ratings response:', ratings);
    res.json(ratings);
  } catch (err) {
    console.error('Admin getStoreRatings error:', err);
    res.status(500).json({ error: 'Failed to fetch store ratings', details: err.message });
  }
};
// Validation rules
const createUserValidation = [
  body('name')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('Password must contain at least one uppercase letter and one special character'),
  body('address')
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters'),
  body('role')
    .isIn(['admin', 'user', 'store_owner'])
    .withMessage('Role must be admin, user, or store_owner')
];

const createStoreValidation = [
  body('name')
    .isLength({ min: 1, max: 255 })
    .withMessage('Store name is required and must not exceed 255 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('address')
    .isLength({ min: 1, max: 400 })
    .withMessage('Address is required and must not exceed 400 characters')
];

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, role } = req.body;
    const [result] = await pool.execute(
      'UPDATE users SET name = ?, email = ?, address = ?, role = ? WHERE id = ?',
      [name, email, address, role, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update store
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, owner_id, ownerEmail } = req.body;

    // Build partial update
    const fields = [];
    const params = [];

    if (typeof name !== 'undefined') { fields.push('name = ?'); params.push(name); }
    if (typeof email !== 'undefined') { fields.push('email = ?'); params.push(email); }
    if (typeof address !== 'undefined') { fields.push('address = ?'); params.push(address); }

    let finalOwnerId = owner_id;
    if (typeof ownerEmail !== 'undefined' && !finalOwnerId) {
      const [owners] = await pool.execute('SELECT id FROM users WHERE email = ? AND role = ?', [ownerEmail, 'store_owner']);
      if (owners.length === 0) {
        return res.status(400).json({ message: 'Store owner not found with this email' });
      }
      finalOwnerId = owners[0].id;
    }
    if (typeof finalOwnerId !== 'undefined') { fields.push('owner_id = ?'); params.push(finalOwnerId); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields provided to update' });
    }

    const sql = `UPDATE stores SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);
    const [result] = await pool.execute(sql, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    res.json({ message: 'Store updated successfully' });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete store
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM stores WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  getDashboardStats,
  createUser,
  createStore,
  getUsers,
  getStores,
  getStoreRatings,
  createUserValidation,
  createStoreValidation,
  updateUser,
  deleteUser,
  updateStore,
  deleteStore,
  restoreRatings
};