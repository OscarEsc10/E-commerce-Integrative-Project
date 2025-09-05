// src/Routes/CartRoutes.js
// Express routes for managing the user's shopping cart
// All routes require authentication

import express from 'express';
import { CartController } from '../Controllers/CartController.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

/**
 * GET / - Retrieve all cart items for the authenticated user
 * POST / - Add a new item to the cart for the authenticated user
 * PUT /:id - Update a cart item by ID for the authenticated user
 * DELETE /:id - Remove a cart item by ID for the authenticated user
 * All routes require a valid JWT token
 */
router.get('/', authenticateToken, CartController.getAll);
router.post('/', authenticateToken, CartController.create);
router.put('/:id', authenticateToken, CartController.update);
router.delete('/:id', authenticateToken, CartController.delete);

export default router;
