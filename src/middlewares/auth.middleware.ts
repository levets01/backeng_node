
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, TokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

/**
 * Middleware that verifies JWT authentication.
 *
 * Extracts and validates the Bearer token from the request headers,
 * then attaches the decoded token payload to the request.
 *
 * @param req - Express authenticated request.
 * @param res - Express response used to return authentication errors.
 * @param next - Callback that passes control to the next middleware.
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token de autenticación requerido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

