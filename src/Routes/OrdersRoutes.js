import express from 'express';
import { OrderController } from '../Controllers/OrderController.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, OrderController.getAll);
router.get('/seller', authenticateToken, OrderController.getBySeller);
router.get('/:id', authenticateToken, OrderController.getById);
router.post('/', authenticateToken, OrderController.create);


// rutas admin
router.get('/admin/all', authenticateToken, OrderController.getAllAdmin);
router.patch('/admin/:id/status', authenticateToken, OrderController.updateStatus);


// sellers
export default router;
