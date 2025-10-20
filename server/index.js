
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// load environment variables immediately so imported modules can use them
dotenv.config();
import { initializeDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import storeRoutes from './routes/stores.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
// Capture raw request body for debugging (temporary)
app.use(express.json({ verify: (req, res, buf) => { try { req.rawBody = buf && buf.toString(); } catch (e) { req.rawBody = undefined; } } }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);

// Temporary debug route - echo request headers/body and log raw body
app.post('/api/debug/echo', (req, res) => {
  console.log('--- DEBUG ECHO ---');
  console.log('Headers:', req.headers);
  console.log('Raw Body:', req.rawBody);
  console.log('Parsed Body:', req.body);
  res.json({ headers: req.headers, rawBody: req.rawBody, body: req.body });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Log full error for debugging
  console.error('Global error handler caught:', err && err.stack ? err.stack : err);
  // Temporarily return the real error message in the response to speed debugging.
  // Remove or restrict this in production after debugging.
  const message = err && err.message ? err.message : 'Something went wrong!';
  res.status(500).json({ message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('FATAL: JWT_SECRET is not set. Set JWT_SECRET in environment before starting the server.');
      process.exit(1);
    }
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Server startup timestamp:', new Date().toISOString());
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log('Default admin credentials: admin@roxiler.com / Admin@123');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();