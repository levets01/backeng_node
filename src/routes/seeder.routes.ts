import { Router } from 'express';
import multer from 'multer';
import { seedData } from '../controllers/seeder.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos JSON'));
    }
  },
});

const router = Router();

/**
 * @swagger
 * /api/seeders/upload:
 *   post:
 *     tags: [Seeders]
 *     summary: Cargar datos iniciales desde un archivo JSON
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Datos cargados exitosamente
 *       400:
 *         description: No se proporcionó archivo
 */
router.post(
  '/upload',
  authenticate,
  authorize('admin'),
  upload.single('file'),
  seedData
);

export default router;
