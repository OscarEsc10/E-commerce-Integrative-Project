// src/Routes/sellerRequestRoutes.js
// Express routes for managing seller requests
// Some routes are for admin, others for customers

import { Router } from 'express';
import { SellerRequestController } from '../Controllers/sellerRequestController.js';

const router = Router();

/**
 * GET / - Get all seller requests (admin)
 * GET /user/:userId - Get seller requests for a specific user (customer)
 * POST / - Create a new seller request (customer)
 * PUT /:id/status - Update seller request status (admin)
 * DELETE /:id - Delete a seller request (admin, optional)
 */
router.get('/', SellerRequestController.getAll);
router.get('/user/:userId', SellerRequestController.getByUser);
router.post('/', SellerRequestController.create);
router.put('/:id/status', SellerRequestController.updateStatus);
router.delete('/:id', SellerRequestController.delete);

export default router;
