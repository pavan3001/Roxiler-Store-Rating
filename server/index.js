
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
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
// Configure CORS:
// - In development allow any origin (makes local dev with Vite easier)
// - In production restrict to FRONTEND_URL or a comma-separated FRONTEND_URLS env var
const isProduction = process.env.NODE_ENV === 'production';
// Default frontend allowed origin (deployed frontend)
const DEFAULT_FRONTEND = 'https://roxiler-rating.netlify.app';
let frontendUrls = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// If running in production and no FRONTEND_URL(S) provided, allow the known Netlify frontend.
if (isProduction && frontendUrls.length === 0) {
  frontendUrls = [DEFAULT_FRONTEND];
}

if (!isProduction) {
  // Relaxed CORS for local development (allows localhost:5173/5174 and other dev hosts)
  app.use(cors({ origin: true, credentials: true }));
} else {
  app.use(cors({
    origin: function (origin, callback) {
      // Allow non-browser requests (like curl, Postman) with no Origin
      if (!origin) return callback(null, true);
      if (frontendUrls.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }));
}
app.use(express.json());
// Request logging for diagnostics
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Log full error stack for diagnostics (captured by host logs)
  console.error(err && err.stack ? err.stack : err);
  // In development, return the real error message to help debugging.
  if (process.env.NODE_ENV !== 'production') {
    return res.status(500).json({ message: err.message || 'Something went wrong!', stack: err.stack });
  }
  // In production, avoid leaking stack traces
  res.status(500).json({ message: 'Something went wrong!' });
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
      console.log(`Allowed frontend origins: ${frontendUrls.join(', ') || process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log('Default admin credentials: admin@roxiler.com / Admin@123');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();