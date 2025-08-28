import express from 'express';
import { CartController } from '../Controllers/CartController.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, CartController.getAll);
router.post('/', authenticateToken, CartController.add);
router.put('/:id', authenticateToken, CartController.update);
router.delete('/:id', authenticateToken, CartController.delete);
router.delete('/', authenticateToken, CartController.clear);

export default router;
