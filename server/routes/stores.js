import express from 'express';
import {
  getStores,
  submitRating,
  getStoreOwnerDashboard
} from '../controllers/storeController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Routes for normal users
router.get('/', authorizeRoles('user', 'admin'), getStores);
router.post('/rating', authorizeRoles('user', 'admin'), submitRating);

// Routes for store owners
router.get('/owner/dashboard', authorizeRoles('store_owner'), getStoreOwnerDashboard);

export default router;