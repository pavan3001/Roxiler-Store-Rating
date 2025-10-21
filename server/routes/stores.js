import express from 'express';
import {
  getStores,
  submitRating,
  getStoreOwnerDashboard
  , createStoreForOwner
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
// Allow store owners to create a store for themselves
router.post('/', authorizeRoles('store_owner'), createStoreForOwner);
// Allow store owners to update or delete their own stores
router.put('/:id', authorizeRoles('store_owner'), async (req, res, next) => {
  // delegate to controller-level logic in storeController
  // we import lazily to avoid circular import ordering issues
  try {
    const { updateStoreForOwner } = await import('../controllers/storeController.js');
    return updateStoreForOwner(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authorizeRoles('store_owner'), async (req, res, next) => {
  try {
    const { deleteStoreForOwner } = await import('../controllers/storeController.js');
    return deleteStoreForOwner(req, res, next);
  } catch (err) {
    next(err);
  }
});

export default router;