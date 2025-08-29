// src/Routes/authRoutes.js
// Authentication routes
import express from 'express';
import { AuthController } from '../Controllers/AuthController.js';
import { authenticateToken } from '../Middleware/auth.js';
import { 
  validateRegistration, 
  validateLogin, 
  validateProfileUpdate, 
  validatePasswordChange 
} from '../Utils/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, AuthController.register);
router.post('/login', validateLogin, AuthController.login); 

// Protected routes (require authentication)
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, validateProfileUpdate, AuthController.updateProfile);
router.put('/change-password', authenticateToken, validatePasswordChange, AuthController.changePassword);

export default router;
