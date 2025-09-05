// src/Routes/InvoiceRoutes.js
// Express routes for managing invoices
// All routes require authentication

import express from 'express';
import { InvoiceController } from '../Controllers/InvoiceController.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

/**
 * GET / - Retrieve all invoices for the authenticated user
 * GET /:id - Retrieve a specific invoice by ID for the authenticated user
 * POST / - Create a new invoice for the authenticated user
 * All routes require a valid JWT token
 */
router.get('/', authenticateToken, InvoiceController.getAll);
router.get('/:id', authenticateToken, InvoiceController.getById);
router.post('/', authenticateToken, InvoiceController.create);

export default router;
