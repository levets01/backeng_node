
import { Request, Response } from 'express';
import { CreateUserDTO, LoginUserDTO } from '../types';
import { userService } from '../services/user.service';

/**
 * Registers a new user in the system.
 *
 * @param req - Express request containing the user registration data.
 * @param res - Express response used to return the registration result.
 * @returns A promise that resolves when the registration process is completed.
 */
export const register = async (
  req: Request<{}, {}, CreateUserDTO>,
  res: Response
): Promise<void> => {
  try {
    const result = await userService.register(req.body);
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      ...result,
    });
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al registrar usuario';
    res.status(status).json({
      message,
      error: error?.message,
    });
  }
};

/**
 * Authenticates a user and returns a JWT token.
 *
 * @param req - Express request containing the user's login credentials.
 * @param res - Express response used to return the authentication result.
 * @returns A promise that resolves when the login process is completed.
 */
export const login = async (
  req: Request<{}, {}, LoginUserDTO>,
  res: Response
): Promise<void> => {
  try {
    const result = await userService.login(req.body);
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      ...result,
    });
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al iniciar sesión';
    res.status(status).json({
      message,
      error: error?.message,
    });
  }
};

/**
 * Retrieves all active users from the system.
 *
 * @param _req - Express request object.
 * @param res - Express response used to return the list of users.
 * @returns A promise that resolves with the active users.
 */
export const getUsers = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Error al obtener usuarios';
    res.status(status).json({
      message,
      error: error?.message,
    });
  }
};
