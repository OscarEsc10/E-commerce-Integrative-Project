// Routes/AddressRoutes.js
import express from 'express';
import { AddressController } from '../Controllers/addressesController.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, AddressController.getAll);
router.post('/', authenticateToken, AddressController.create);
router.put('/:id', authenticateToken, AddressController.update);
router.delete('/:id', authenticateToken, AddressController.delete);

export default router;
