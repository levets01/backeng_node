import { Router } from 'express';
import { getClinics, getClinicById, createClinic, updateClinic, deleteClinic } from '../controllers/clinic.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validateRequiredFields } from '../middlewares/validation.middleware';

const router = Router();

/**
 * @swagger
 * /api/clinics:
 *   get:
 *     tags: [Clínicas]
 *     summary: Obtener todas las clínicas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clínicas
 */
router.get('/', authenticate, getClinics);

/**
 * @swagger
 * /api/clinics/{id}:
 *   get:
 *     tags: [Clínicas]
 *     summary: Obtener clínica por ID
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
 *         description: Clínica encontrada
 *       404:
 *         description: Clínica no encontrada
 */
router.get('/:id', authenticate, getClinicById);

/**
 * @swagger
 * /api/clinics:
 *   post:
 *     tags: [Clínicas]
 *     summary: Crear una nueva clínica
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, nit, address, phone, responsibleId]
 *             properties:
 *               name:
 *                 type: string
 *               nit:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               responsibleId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Clínica creada
 *       400:
 *         description: NIT duplicado o datos inválidos
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequiredFields(['name', 'nit', 'address', 'phone', 'responsibleId']),
  createClinic
);

/**
 * @swagger
 * /api/clinics/{id}:
 *   put:
 *     tags: [Clínicas]
 *     summary: Actualizar una clínica
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
 *               nit:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Clínica actualizada
 *       404:
 *         description: Clínica no encontrada
 */
router.put('/:id', authenticate, authorize('admin'), updateClinic);

/**
 * @swagger
 * /api/clinics/{id}:
 *   delete:
 *     tags: [Clínicas]
 *     summary: Eliminar una clínica (soft delete)
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
 *         description: Clínica eliminada
 *       404:
 *         description: Clínica no encontrada
 */
router.delete('/:id', authenticate, authorize('admin'), deleteClinic);

export default router;
