import express from 'express';
import { InvoiceController } from '../Controllers/InvoiceController.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, InvoiceController.getAll);
router.get('/:id', authenticateToken, InvoiceController.getById);
router.post('/', authenticateToken, InvoiceController.create);

export default router;
