import { Router } from 'express';
import { getSupplyRequests, getSupplyRequestById, createSupplyRequest, updateSupplyRequestStatus, getRequestHistoryByClinic, deleteSupplyRequest } from '../controllers/supplyRequest.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validateRequiredFields, validatePositiveInteger } from '../middlewares/validation.middleware';

const router = Router();

/**
 * @swagger
 * /api/supply-requests:
 *   get:
 *     tags: [Solicitudes]
 *     summary: Obtener todas las solicitudes activas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 */
router.get('/', authenticate, getSupplyRequests);

/**
 * @swagger
 * /api/supply-requests/{id}:
 *   get:
 *     tags: [Solicitudes]
 *     summary: Obtener solicitud por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Solicitud encontrada
 *       404:
 *         description: Solicitud no encontrada
 */
router.get('/:id', authenticate, getSupplyRequestById);

/**
 * @swagger
 * /api/supply-requests:
 *   post:
 *     tags: [Solicitudes]
 *     summary: Crear una nueva solicitud de abastecimiento
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clinicId, medicationId, quantity, warehouseId]
 *             properties:
 *               clinicId:
 *                 type: integer
 *               medicationId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               warehouseId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Solicitud creada
 *       400:
 *         description: Stock insuficiente o cantidad inválida
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'gestor'),
  validateRequiredFields(['clinicId', 'medicationId', 'quantity', 'warehouseId']),
  validatePositiveInteger('quantity'),
  createSupplyRequest
);

/**
 * @swagger
 * /api/supply-requests/{id}/status:
 *   patch:
 *     tags: [Solicitudes]
 *     summary: Actualizar el estado de una solicitud
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pendiente, en_proceso, completada, cancelada]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: Transición de estado no válida
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin', 'gestor'),
  validateRequiredFields(['status']),
  updateSupplyRequestStatus
);

/**
 * @swagger
 * /api/supply-requests/history/{clinicId}:
 *   get:
 *     tags: [Solicitudes]
 *     summary: Obtener historial de solicitudes por clínica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Historial de solicitudes
 *       404:
 *         description: Clínica no encontrada
 */
router.get('/history/:clinicId', authenticate, getRequestHistoryByClinic);

/**
 * @swagger
 * /api/supply-requests/{id}:
 *   delete:
 *     tags: [Solicitudes]
 *     summary: Eliminar una solicitud (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Solicitud eliminada
 */
router.delete('/:id', authenticate, authorize('admin'), deleteSupplyRequest);

export default router;
