import { Router } from 'express';
import { getMedications, getMedicationById, createMedication, updateMedication, deleteMedication, assignStock } from '../controllers/medication.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validateRequiredFields } from '../middlewares/validation.middleware';

const router = Router();

/**
 * @swagger
 * /api/medications:
 *   get:
 *     tags: [Medicamentos]
 *     summary: Obtener todos los medicamentos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de medicamentos
 */
router.get('/', authenticate, getMedications);

/**
 * @swagger
 * /api/medications/{id}:
 *   get:
 *     tags: [Medicamentos]
 *     summary: Obtener medicamento por ID
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
 *         description: Medicamento encontrado
 *       404:
 *         description: Medicamento no encontrado
 */
router.get('/:id', authenticate, getMedicationById);

/**
 * @swagger
 * /api/medications:
 *   post:
 *     tags: [Medicamentos]
 *     summary: Crear un nuevo medicamento
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, unitPrice]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               unitPrice:
 *                 type: number
 *     responses:
 *       201:
 *         description: Medicamento creado
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequiredFields(['name', 'description', 'unitPrice']),
  createMedication
);

/**
 * @swagger
 * /api/medications/{id}:
 *   put:
 *     tags: [Medicamentos]
 *     summary: Actualizar un medicamento
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               unitPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Medicamento actualizado
 */
router.put('/:id', authenticate, authorize('admin'), updateMedication);

/**
 * @swagger
 * /api/medications/{id}:
 *   delete:
 *     tags: [Medicamentos]
 *     summary: Eliminar un medicamento (soft delete)
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
 *         description: Medicamento eliminado
 */
router.delete('/:id', authenticate, authorize('admin'), deleteMedication);

/**
 * @swagger
 * /api/medications/stock:
 *   post:
 *     tags: [Medicamentos]
 *     summary: Asignar stock de un medicamento a un almacén
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [warehouseId, medicationId, stock]
 *             properties:
 *               warehouseId:
 *                 type: integer
 *               medicationId:
 *                 type: integer
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Stock asignado
 */
router.post(
  '/stock',
  authenticate,
  authorize('admin'),
  validateRequiredFields(['warehouseId', 'medicationId', 'stock']),
  assignStock
);

export default router;
