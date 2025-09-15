
import express from 'express';
import {
  register,
  login,
  updatePassword,
  registerValidation,
  loginValidation,
  updatePasswordValidation
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.put('/update-password', authenticateToken, updatePasswordValidation, updatePassword);

export default router;