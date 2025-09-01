// Routes/AddressRoutes.js
// Express routes for managing user addresses
// All routes require authentication

import express from 'express';
import { AddressController } from '../Controllers/addressesController.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

/**
 * GET / - Retrieve all addresses for the authenticated user
 * POST / - Create a new address for the authenticated user
 * PUT /:id - Update an address by ID for the authenticated user
 * DELETE /:id - Delete an address by ID for the authenticated user
 * All routes require a valid JWT token
 */
router.get('/', authenticateToken, AddressController.getAll);
router.post('/', authenticateToken, AddressController.create);
router.put('/:id', authenticateToken, AddressController.update);
router.delete('/:id', authenticateToken, AddressController.delete);

export default router;
