// src/Routes/PaymentsRoutes.js
// Express routes for managing payments
// All routes require authentication

import express from 'express';
import { PaymentController } from '../Controllers/PaymentsController.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

/**
 * GET /order/:order_id - Retrieve payment details for a specific order
 * POST / - Create a new payment
 * PUT /:id - Update payment status by ID
 * POST /process - Process a payment
 * GET /status - Get payment status
 * All routes require a valid JWT token
 */
router.get('/order/:order_id', authenticateToken, PaymentController.getByOrder);
router.post('/', authenticateToken, PaymentController.create);
router.put('/:id', authenticateToken, PaymentController.updateStatus);
router.post('/process', authenticateToken, PaymentController.processPayment);
router.get('/status', authenticateToken, PaymentController.getPaymentStatus);

export default router;
