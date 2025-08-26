import { Router } from 'express';
import { CategoryController } from '../Controllers/CategoryController.js';
import { authenticateToken, requireRole } from '../Middleware/auth.js';

const router = Router();

// Todos pueden ver categorías
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);

// Solo admin puede crear/editar/eliminar
router.use(authenticateToken, requireRole(['admin']));
router.post('/', CategoryController.create);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.delete);

export default router;
