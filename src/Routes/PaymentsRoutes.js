import express from 'express';
import { PaymentController } from '../Controllers/PaymentsController.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

router.get('/order/:order_id', authenticateToken, PaymentController.getByOrder);
router.post('/', authenticateToken, PaymentController.create);
router.put('/:id', authenticateToken, PaymentController.updateStatus);
router.post('/process', authenticateToken, PaymentController.processPayment);
router.get('/status', authenticateToken, PaymentController.getPaymentStatus);

export default router;
