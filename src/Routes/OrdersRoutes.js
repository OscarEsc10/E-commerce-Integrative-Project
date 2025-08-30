import express from 'express';
import { OrderController } from '../Controllers/OrderController.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, OrderController.getAll);
router.get('/:id', authenticateToken, OrderController.getById);
router.post('/', authenticateToken, OrderController.create);

export default router;
