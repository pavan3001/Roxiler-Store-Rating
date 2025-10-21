import { pool } from '../config/database.js';

const getStores = async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const userId = req.user?.id;
    console.log('Fetching stores for userId:', userId, 'role:', req.user?.role);
    let query = `
      SELECT s.id, s.name, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as overall_rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];
    if (search) {
      query += ` AND (s.name LIKE ? OR s.address LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ` GROUP BY s.id`;
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    console.log('SQL Query:', query);
    console.log('Params:', params);
    const [storesRaw] = await pool.execute(query, params);
    // Now fetch user_rating for each store
    let userRatings = {};
    if (userId) {
      const storeIds = storesRaw.map(s => s.id);
      if (storeIds.length > 0) {
        const [ratings] = await pool.execute(
          `SELECT store_id, rating FROM ratings WHERE user_id = ? AND store_id IN (${storeIds.map(() => '?').join(',')})`,
          [userId, ...storeIds]
        );
        ratings.forEach(r => { userRatings[r.store_id] = r.rating; });
      }
    }
    // Attach user_rating to each store
    const stores = storesRaw.map(s => ({ ...s, user_rating: userRatings[s.id] || null }));
    console.log('Fetched stores:', stores);
    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if store exists
    const [stores] = await pool.execute('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Get rater name
    const [userRows] = await pool.execute('SELECT name FROM users WHERE id = ?', [userId]);
    const raterName = userRows.length > 0 ? userRows[0].name : '';

      // Insert or update rating with rater_name, only set created_at on insert
      await pool.execute(`
        INSERT INTO ratings (user_id, store_id, rating, rater_name, created_at)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE rating = VALUES(rating), rater_name = VALUES(rater_name)
      `, [userId, storeId, rating, raterName]);

    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getStoreOwnerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get store owned by this user
    const [stores] = await pool.execute(
      'SELECT id, name FROM stores WHERE owner_id = ?',
      [userId]
    );

    if (stores.length === 0) {
      return res.status(404).json({ message: 'No store found for this owner' });
    }

    // For each store, fetch average rating and rating users
    const resultStores = [];
    for (const s of stores) {
      const storeId = s.id;
      const [avgRating] = await pool.execute(
        'SELECT COALESCE(AVG(rating), 0) as average_rating FROM ratings WHERE store_id = ?',
        [storeId]
      );
      const [ratingUsers] = await pool.execute(`
        SELECT u.name, u.email, r.rating, r.created_at
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        WHERE r.store_id = ?
        ORDER BY r.created_at DESC
      `, [storeId]);

      resultStores.push({
        store: s,
        averageRating: parseFloat(avgRating[0].average_rating).toFixed(1),
        ratingUsers
      });
    }

    res.json({ stores: resultStores });
  } catch (error) {
    console.error('Store owner dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  getStores,
  submitRating,
  getStoreOwnerDashboard
};

// Create store for authenticated store owner
const createStoreForOwner = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, address } = req.body;

    if (!name || !email || !address) {
      return res.status(400).json({ message: 'Name, email and address are required' });
    }

    // Check if store already exists by email
    const [existingStores] = await pool.execute('SELECT id FROM stores WHERE email = ?', [email]);
    if (existingStores.length > 0) {
      return res.status(400).json({ message: 'Store already exists with this email' });
    }

      // NOTE: multiple stores per owner are allowed (no owner-specific guard)

    const [result] = await pool.execute(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, userId]
    );

    res.status(201).json({
      message: 'Store created successfully',
      store: {
        id: result.insertId,
        name,
        email,
        address,
        owner_id: userId
      }
    });
  } catch (error) {
    console.error('Create store for owner error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update store for owner (only if owner owns the store)
const updateStoreForOwner = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, email, address } = req.body;

    // Ensure the store belongs to this owner
    const [stores] = await pool.execute('SELECT owner_id FROM stores WHERE id = ?', [id]);
    if (stores.length === 0) return res.status(404).json({ message: 'Store not found' });
    if (stores[0].owner_id !== userId) return res.status(403).json({ message: 'Not allowed' });

    // Build partial update
    const fields = [];
    const params = [];
    if (typeof name !== 'undefined') { fields.push('name = ?'); params.push(name); }
    if (typeof email !== 'undefined') { fields.push('email = ?'); params.push(email); }
    if (typeof address !== 'undefined') { fields.push('address = ?'); params.push(address); }

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
    console.error('updateStoreForOwner error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete store for owner (only if owner owns the store)
const deleteStoreForOwner = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Ensure the store belongs to this owner
    const [stores] = await pool.execute('SELECT owner_id FROM stores WHERE id = ?', [id]);
    if (stores.length === 0) return res.status(404).json({ message: 'Store not found' });
    if (stores[0].owner_id !== userId) return res.status(403).json({ message: 'Not allowed' });

    await pool.execute('DELETE FROM stores WHERE id = ?', [id]);
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('deleteStoreForOwner error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { updateStoreForOwner, deleteStoreForOwner };

export { createStoreForOwner };