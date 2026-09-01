import User from '../models/User';
import { userRepository } from '../repositories/user.repository';
import { CreateUserDTO, LoginUserDTO } from '../types';
import jwt from 'jsonwebtoken';

const JWT_SECRET: string = (process.env.JWT_SECRET || 'default_secret') as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const userService = {
  async register(data: CreateUserDTO) {
    const { name, email, password, role } = data;

    // Validaciones
    if (!name || !email || !password) {
      throw {
        status: 400,
        message: 'Nombre, correo y contraseña son obligatorios',
      };
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw {
        status: 400,
        message: 'El correo ya está registrado',
      };
    }

    const user = await userRepository.create({
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
      { expiresIn: 86400 } as any
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },

  async login(data: LoginUserDTO) {
    const { email, password } = data;

    if (!email || !password) {
      throw {
        status: 400,
        message: 'Correo y contraseña son obligatorios',
      };
    }

    const user = await userRepository.findActiveByEmail(email);
    if (!user) {
      throw {
        status: 401,
        message: 'Credenciales inválidas',
      };
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: 86400 } as any
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },

  async getAllUsers() {
    return userRepository.findAllActive();
  },

  async getUserById(id: number) {
    const user = await userRepository.findById(id);
    if (!user || !user.isActive) {
      throw {
        status: 404,
        message: 'Usuario no encontrado',
      };
    }
    return user;
  },

  async updateUser(id: number, data: Partial<CreateUserDTO>) {
    const user = await userRepository.findById(id);
    if (!user || !user.isActive) {
      throw {
        status: 404,
        message: 'Usuario no encontrado',
      };
    }
    return user.update(data);
  },
};
