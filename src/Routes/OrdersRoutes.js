// src/Routes/OrdersRoutes.js
// Express routes for managing orders
// All routes require authentication

import express from 'express';
import { OrderController } from '../Controllers/OrderController.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

/**
 * GET / - Retrieve all orders for the authenticated user
 * GET /seller - Retrieve orders for the authenticated seller
 * GET /customer - Retrieve orders for the authenticated customer
 * GET /:id - Retrieve a specific order by ID
 * POST / - Create a new order
 * GET /admin/all - Retrieve all orders (admin only)
 * PATCH /admin/:id/status - Update order status (admin only)
 * All routes require a valid JWT token
 */
router.get('/', authenticateToken, OrderController.getAll);
router.get('/seller', authenticateToken, OrderController.getBySeller);
router.get('/customer', authenticateToken, OrderController.getByCustomer);
router.get('/:id', authenticateToken, OrderController.getById);
router.post('/', authenticateToken, OrderController.create);
router.get('/admin/all', authenticateToken, OrderController.getAllAdmin);
router.patch('/admin/:id/status', authenticateToken, OrderController.updateStatus);


export default router;
