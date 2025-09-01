import express from 'express';
import { OrderController } from '../Controllers/OrderController.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, OrderController.getAll);
//seller
router.get('/seller', authenticateToken, OrderController.getBySeller);
// rutas customer
router.get('/customer', authenticateToken, OrderController.getByCustomer);
//
router.get('/:id', authenticateToken, OrderController.getById);

//
router.post('/', authenticateToken, OrderController.create);


// rutas admin
router.get('/admin/all', authenticateToken, OrderController.getAllAdmin);
router.patch('/admin/:id/status', authenticateToken, OrderController.updateStatus);


// sellers
export default router;
