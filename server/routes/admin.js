import express from 'express';
import {
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
} from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Restore ratings (admin utility)
router.post('/restore-ratings', restoreRatings);

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// Create user
router.post('/users', createUserValidation, createUser);
// Get users
router.get('/users', getUsers);

// Get stores

// Create store
router.post('/stores', createStoreValidation, createStore);
// Get stores
router.get('/stores', getStores);
// Get all ratings for a store (with user info)
router.get('/stores/:id/ratings', getStoreRatings);


// Update and delete user
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Update and delete store
router.put('/stores/:id', updateStore);
router.delete('/stores/:id', deleteStore);

export default router;