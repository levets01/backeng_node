
import { Request, Response } from 'express';
import User from '../models/User';
import { CreateUserDTO, LoginUserDTO } from '../types';
import jwt from 'jsonwebtoken';

const JWT_SECRET: string =
  process.env.JWT_SECRET || 'default_secret';

const JWT_EXPIRES_IN =
  process.env.JWT_EXPIRES_IN || '24h';

/** * Registers a new user in the system. * * @param req - Express request containing the user registration data. 
 * 
 * 
 * @param res - Express response used to return the registration result. 
 * 
 * * @returns A promise that resolves when the registration process is completed. 
 * */
export const register = async (
  req: Request<{}, {}, CreateUserDTO>,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Validación básica
    if (!name || !email || !password) {
      res.status(400).json({
        message: 'Nombre, correo y contraseña son obligatorios',
      });
      return;
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({
        message: 'El correo ya está registrado',
      });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: 86400,
      }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido';

    res.status(500).json({
      message: 'Error al registrar usuario',
      error: message,
    });
  }
};


/** * Authenticates a user and returns a JWT token. * 
  * @param req - Express request containing the user's login credentials. 
 * @param res - Express response used to return the authentication result. 
 * @returns A promise that resolves when the login process is completed. */



export const login = async (
  req: Request<{}, {}, LoginUserDTO>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: 'Correo y contraseña son obligatorios',
      });
      return;
    }

    const user = await User.findOne({
      where: {
        email,
        isActive: true,
      },
    });

    if (!user) {
      res.status(401).json({
        message: 'Credenciales inválidas',
      });
      return;
    }

    const isValid = await user.validatePassword(password);

    if (!isValid) {
      res.status(401).json({
        message: 'Credenciales inválidas',
      });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: 86400,
      }
    );

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido';

    res.status(500).json({
      message: 'Error al iniciar sesión',
      error: message,
    });
  }
};

/** * Retrieves all active users from the system. 
 *  @param _req - Express request object. 
 * @param res - Express response used to return the list of users. 
 * @returns A promise that resolves with the active users. */


export const getUsers = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.findAll({
      where: {
        isActive: true,
      },
      attributes: {
        exclude: ['password'],
      },
    });

    res.status(200).json(users);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error desconocido';

    res.status(500).json({
      message: 'Error al obtener usuarios',
      error: message,
    });
  }
};
