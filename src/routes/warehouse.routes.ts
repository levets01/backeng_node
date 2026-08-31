import { Router } from 'express';
import { getWarehouses, getWarehouseById, createWarehouse, updateWarehouse, deleteWarehouse } from '../controllers/warehouse.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validateRequiredFields } from '../middlewares/validation.middleware';

const router = Router();

/**
 * @swagger
 * /api/warehouses:
 *   get:
 *     tags: [Almacenes]
 *     summary: Obtener todos los almacenes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de almacenes
 */
router.get('/', authenticate, getWarehouses);

/**
 * @swagger
 * /api/warehouses/{id}:
 *   get:
 *     tags: [Almacenes]
 *     summary: Obtener almacén por ID
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
 *         description: Almacén encontrado
 *       404:
 *         description: Almacén no encontrado
 */
router.get('/:id', authenticate, getWarehouseById);

/**
 * @swagger
 * /api/warehouses:
 *   post:
 *     tags: [Almacenes]
 *     summary: Crear un nuevo almacén
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, location, responsibleId]
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               responsibleId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Almacén creado
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequiredFields(['name', 'location', 'responsibleId']),
  createWarehouse
);

/**
 * @swagger
 * /api/warehouses/{id}:
 *   put:
 *     tags: [Almacenes]
 *     summary: Actualizar un almacén
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
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Almacén actualizado
 */
router.put('/:id', authenticate, authorize('admin'), updateWarehouse);

/**
 * @swagger
 * /api/warehouses/{id}:
 *   delete:
 *     tags: [Almacenes]
 *     summary: Eliminar un almacén (soft delete)
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
 *         description: Almacén eliminado
 */
router.delete('/:id', authenticate, authorize('admin'), deleteWarehouse);

export default router;
