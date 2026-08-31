import jwt from 'jsonwebtoken';

jest.mock('../config/database', () => {
  return { default: { authenticate: jest.fn(), sync: jest.fn() } };
});

jest.mock('../models', () => ({}));

const mockFindOne = jest.fn();
const mockCreate = jest.fn();
const mockFindAll = jest.fn();
const mockHash = jest.fn().mockResolvedValue('hashed_password');
const mockCompare = jest.fn().mockResolvedValue(true);

jest.mock('../models/User', () => {
  const actualBcrypt = require('bcryptjs');
  return {
    __esModule: true,
    default: {
      findOne: (...args: any[]) => mockFindOne(...args),
      create: (...args: any[]) => mockCreate(...args),
      findAll: (...args: any[]) => mockFindAll(...args),
    },
  };
});

import { register, login, getUsers } from '../controllers/auth.controller';

const createMockReq = (body: any = {}): any => ({ body });
const createMockRes = (): any => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debe registrar un usuario exitosamente', async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        id: 1, name: 'Test', email: 'test@test.com', role: 'admin',
      });

      const req = createMockReq({ name: 'Test', email: 'test@test.com', password: '123456', role: 'admin' });
      const res = createMockRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Usuario registrado exitosamente' })
      );
    });

    it('debe rechazar registro con correo duplicado', async () => {
      mockFindOne.mockResolvedValue({ id: 1, email: 'dup@test.com' });

      const req = createMockReq({ name: 'Dup', email: 'dup@test.com', password: '123456' });
      const res = createMockRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'El correo ya está registrado' })
      );
    });

    it('debe manejar errores del servidor', async () => {
      mockFindOne.mockRejectedValue(new Error('DB error'));

      const req = createMockReq({ name: 'Test', email: 'test@test.com', password: '123456' });
      const res = createMockRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('login', () => {
    it('debe iniciar sesión exitosamente', async () => {
      mockFindOne.mockResolvedValue({
        id: 1, name: 'Test', email: 'test@test.com', role: 'admin',
        validatePassword: jest.fn().mockResolvedValue(true),
      });

      const req = createMockReq({ email: 'test@test.com', password: '123456' });
      const res = createMockRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Inicio de sesión exitoso' })
      );
    });

    it('debe rechazar credenciales inválidas (usuario no encontrado)', async () => {
      mockFindOne.mockResolvedValue(null);

      const req = createMockReq({ email: 'noexist@test.com', password: 'wrong' });
      const res = createMockRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('debe rechazar contraseña incorrecta', async () => {
      mockFindOne.mockResolvedValue({
        id: 1, email: 'test@test.com', role: 'admin',
        validatePassword: jest.fn().mockResolvedValue(false),
      });

      const req = createMockReq({ email: 'test@test.com', password: 'wrong' });
      const res = createMockRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('debe manejar errores del servidor', async () => {
      mockFindOne.mockRejectedValue(new Error('DB error'));

      const req = createMockReq({ email: 'test@test.com', password: '123456' });
      const res = createMockRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getUsers', () => {
    it('debe retornar la lista de usuarios', async () => {
      mockFindAll.mockResolvedValue([
        { id: 1, name: 'User1', email: 'u1@test.com', role: 'admin' },
      ]);

      const req = createMockReq();
      const res = createMockRes();

      await getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'User1' }),
        ])
      );
    });

    it('debe manejar errores del servidor', async () => {
      mockFindAll.mockRejectedValue(new Error('DB error'));

      const req = createMockReq();
      const res = createMockRes();

      await getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
