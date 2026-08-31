import { Router } from 'express';
import { register, login, getUsers } from '../controllers/auth.controller';
import { validateRequiredFields } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar un nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan@correo.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 enum: [admin, gestor]
 *                 example: admin
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: El correo ya está registrado
 */
router.post('/register', validateRequiredFields(['name', 'email', 'password']), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@correo.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', validateRequiredFields(['email', 'password']), login);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener todos los usuarios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/users', authenticate, getUsers);

export default router;
