import { Router } from 'express';
import { SellerRequestController } from '../Controllers/sellerRequestController.js';

const router = Router();

// ADMIN: obtener todas las solicitudes
router.get('/', SellerRequestController.getAll);

// CUSTOMER: obtener solicitudes de un usuario específico
router.get('/user/:userId', SellerRequestController.getByUser);

// CUSTOMER: crear nueva solicitud
router.post('/', SellerRequestController.create);

// ADMIN: actualizar estado
router.put('/:id/status', SellerRequestController.updateStatus);

// ADMIN: eliminar (opcional)
router.delete('/:id', SellerRequestController.delete);

export default router;
