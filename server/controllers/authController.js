import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment');
  }
  // Use a safe default and coerce numeric strings to numbers
  const rawExpires = process.env.JWT_EXPIRES_IN || '7d';
  const expiresIn = /^\d+$/.test(String(rawExpires)) ? Number(rawExpires) : String(rawExpires);
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn
  });
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, password, address } = req.body;

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
      [name, email, password, address, 'user']
    );

    let token;
    try {
      token = generateToken(result.insertId);
    } catch (err) {
      console.error('JWT generation error (register):', err && err.stack ? err.stack : err);
      return res.status(500).json({ message: 'Server configuration error' });
    }

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Registration error:', error && error.stack ? error.stack : error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    // Defensive checks: ensure body is present and contains required fields
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ message: 'Request body must be a JSON object' });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );

  // login attempt logged at debug level previously; removed for production

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
  // user retrieved from DB
    // Check password as plaintext
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    let token;
    try {
      token = generateToken(user.id);
    } catch (err) {
      console.error('JWT generation error:', err && err.stack ? err.stack : err);
      return res.status(500).json({ message: 'Server configuration error' });
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error && error.stack ? error.stack : error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current password
    const [users] = await pool.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password as plaintext
    if (currentPassword !== users[0].password) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password as plaintext
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [newPassword, userId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error && error.stack ? error.stack : error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Validation rules
const registerValidation = [
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
    .withMessage('Address must not exceed 400 characters')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const updatePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('Password must contain at least one uppercase letter and one special character')
];

export {
  register,
  login,
  updatePassword,
  registerValidation,
  loginValidation,
  updatePasswordValidation
};