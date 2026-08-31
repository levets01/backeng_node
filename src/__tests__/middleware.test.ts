import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { authenticate } from '../middlewares/auth.middleware';

import {
  errorHandler,
  notFoundHandler,
} from '../middlewares/error.middleware';

import { authorize } from '../middlewares/role.middleware';

import {
  validateRequiredFields,
  validatePositiveInteger,
  validateUniqueNIT,
} from '../middlewares/validation.middleware';


// ============================================================
// MOCKS
// ============================================================

jest.mock('jsonwebtoken');

jest.mock('../models/Clinic', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

import Clinic from '../models/Clinic';

const mockJwtVerify = jwt.verify as jest.Mock;


// ============================================================
// HELPERS
// ============================================================

const createMockReq = (
  body: any = {},
  headers: any = {},
): any => ({
  body,
  headers,
});

const createMockRes = (): any => {
  const res: any = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

const createMockNext = (): jest.Mock => {
  return jest.fn();
};


// ============================================================
// AUTH MIDDLEWARE
// ============================================================

describe('Auth Middleware', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });


  it('debe rechazar cuando no existe Authorization', () => {

    const req = createMockReq({}, {});

    const res = createMockRes();

    const next = createMockNext();


    authenticate(req, res, next);


    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Token de autenticación requerido',
    });

    expect(next).not.toHaveBeenCalled();
  });


  it('debe rechazar un Authorization que no usa Bearer', () => {

    const req = createMockReq(
      {},
      {
        authorization: 'Basic abc123',
      },
    );

    const res = createMockRes();

    const next = createMockNext();


    authenticate(req, res, next);


    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Token de autenticación requerido',
    });

    expect(next).not.toHaveBeenCalled();
  });


  it('debe autenticar correctamente un token válido', () => {

    const req = createMockReq(
      {},
      {
        authorization: 'Bearer token-valido',
      },
    );

    const res = createMockRes();

    const next = createMockNext();


    const payload = {
      id: 1,
      email: 'admin@test.com',
      role: 'admin',
    };


    mockJwtVerify.mockReturnValue(payload);


    authenticate(req, res, next);


    expect(mockJwtVerify).toHaveBeenCalledWith(
      'token-valido',
      expect.any(String),
    );

    expect(req.user).toEqual(payload);

    expect(next).toHaveBeenCalled();
  });


  it('debe rechazar un token inválido o expirado', () => {

    const req = createMockReq(
      {},
      {
        authorization: 'Bearer token-invalido',
      },
    );

    const res = createMockRes();

    const next = createMockNext();


    mockJwtVerify.mockImplementation(() => {
      throw new Error('Token inválido');
    });


    authenticate(req, res, next);


    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Token inválido o expirado',
    });

    expect(next).not.toHaveBeenCalled();
  });

});


// ============================================================
// ROLE MIDDLEWARE
// ============================================================

describe('Role Middleware', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });


  it('debe rechazar cuando el usuario no está autenticado', () => {

    const req: any = {
      user: undefined,
    };

    const res = createMockRes();

    const next = createMockNext();


    const middleware = authorize('admin');


    middleware(req, res, next);


    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Usuario no autenticado',
    });

    expect(next).not.toHaveBeenCalled();
  });


  it('debe rechazar un usuario sin permisos', () => {

    const req: any = {
      user: {
        id: 2,
        email: 'gestor@test.com',
        role: 'gestor',
      },
    };

    const res = createMockRes();

    const next = createMockNext();


    const middleware = authorize('admin');


    middleware(req, res, next);


    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith({
      message: 'No tienes permisos para realizar esta acción',
      requiredRoles: ['admin'],
      currentRole: 'gestor',
    });

    expect(next).not.toHaveBeenCalled();
  });


  it('debe permitir un usuario con el rol correcto', () => {

    const req: any = {
      user: {
        id: 1,
        email: 'admin@test.com',
        role: 'admin',
      },
    };

    const res = createMockRes();

    const next = createMockNext();


    const middleware = authorize('admin');


    middleware(req, res, next);


    expect(next).toHaveBeenCalled();

    expect(res.status).not.toHaveBeenCalled();
  });


  it('debe permitir cualquiera de los roles autorizados', () => {

    const req: any = {
      user: {
        id: 2,
        email: 'gestor@test.com',
        role: 'gestor',
      },
    };

    const res = createMockRes();

    const next = createMockNext();


    const middleware = authorize('admin', 'gestor');


    middleware(req, res, next);


    expect(next).toHaveBeenCalled();
  });

});


// ============================================================
// VALIDATION MIDDLEWARE
// ============================================================

describe('Validation Middleware', () => {


  // ----------------------------------------------------------
  // validateRequiredFields
  // ----------------------------------------------------------

  describe('validateRequiredFields', () => {

    it('debe rechazar cuando faltan campos', () => {

      const req = createMockReq({
        name: 'Steve',
      });

      const res = createMockRes();

      const next = createMockNext();


      const middleware = validateRequiredFields([
        'name',
        'email',
        'password',
      ]);


      middleware(req, res, next);


      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Faltan campos obligatorios',
        missingFields: [
          'email',
          'password',
        ],
      });

      expect(next).not.toHaveBeenCalled();
    });


    it('debe rechazar valores null y strings vacíos', () => {

      const req = createMockReq({
        name: '',
        email: null,
        password: '123456',
      });

      const res = createMockRes();

      const next = createMockNext();


      const middleware = validateRequiredFields([
        'name',
        'email',
        'password',
      ]);


      middleware(req, res, next);


      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Faltan campos obligatorios',
        missingFields: [
          'name',
          'email',
        ],
      });

      expect(next).not.toHaveBeenCalled();
    });


    it('debe continuar cuando todos los campos existen', () => {

      const req = createMockReq({
        name: 'Steve',
        email: 'steve@test.com',
        password: '123456',
      });

      const res = createMockRes();

      const next = createMockNext();


      const middleware = validateRequiredFields([
        'name',
        'email',
        'password',
      ]);


      middleware(req, res, next);


      expect(next).toHaveBeenCalled();

      expect(res.status).not.toHaveBeenCalled();
    });

  });


  // ----------------------------------------------------------
  // validatePositiveInteger
  // ----------------------------------------------------------

  describe('validatePositiveInteger', () => {

    it('debe continuar si el campo no existe', () => {

      const req = createMockReq({});

      const res = createMockRes();

      const next = createMockNext();


      const middleware = validatePositiveInteger('quantity');


      middleware(req, res, next);


      expect(next).toHaveBeenCalled();

      expect(res.status).not.toHaveBeenCalled();
    });


    it('debe continuar si el valor es null', () => {

      const req = createMockReq({
        quantity: null,
      });

      const res = createMockRes();

      const next = createMockNext();


      const middleware = validatePositiveInteger('quantity');


      middleware(req, res, next);


      expect(next).toHaveBeenCalled();

      expect(res.status).not.toHaveBeenCalled();
    });


    it('debe rechazar un número negativo', () => {

      const req = createMockReq({
        quantity: -5,
      });

      const res = createMockRes();

      const next = createMockNext();


      const middleware = validatePositiveInteger('quantity');


      middleware(req, res, next);


      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        message:
          'El campo "quantity" debe ser un número entero positivo',
      });

      expect(next).not.toHaveBeenCalled();
    });


    it('debe rechazar cero', () => {

      const req = createMockReq({
        quantity: 0,
      });

      const res = createMockRes();

      const next = createMockNext();


      const middleware = validatePositiveInteger('quantity');


      middleware(req, res, next);


      expect(res.status).toHaveBeenCalledWith(400);

      expect(next).not.toHaveBeenCalled();
    });


    it('debe rechazar un número decimal', () => {

      const req = createMockReq({
        quantity: 2.5,
      });

      const res = createMockRes();

      const next = createMockNext();


      const middleware = validatePositiveInteger('quantity');


      middleware(req, res, next);


      expect(res.status).toHaveBeenCalledWith(400);

      expect(next).not.toHaveBeenCalled();
    });


    it('debe rechazar texto que no representa un número', () => {

      const req = createMockReq({
        quantity: 'abc',
      });

      const res = createMockRes();

      const next = createMockNext();


      const middleware = validatePositiveInteger('quantity');


      middleware(req, res, next);


      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        message:
          'El campo "quantity" debe ser un número entero positivo',
      });

      expect(next).not.toHaveBeenCalled();
    });


    it('debe aceptar un entero positivo', () => {

      const req = createMockReq({
        quantity: 10,
      });

      const res = createMockRes();

      const next = createMockNext();


      const middleware = validatePositiveInteger('quantity');


      middleware(req, res, next);


      expect(next).toHaveBeenCalled();

      expect(res.status).not.toHaveBeenCalled();
    });


    it('debe aceptar un entero positivo enviado como string', () => {

      const req = createMockReq({
        quantity: '10',
      });

      const res = createMockRes();

      const next = createMockNext();


      const middleware = validatePositiveInteger('quantity');


      middleware(req, res, next);


      expect(next).toHaveBeenCalled();
    });

  });


  // ----------------------------------------------------------
  // validateUniqueNIT
  // ----------------------------------------------------------

  describe('validateUniqueNIT', () => {

    it('debe continuar si no se envía NIT', async () => {

      const req = createMockReq({});

      const res = createMockRes();

      const next = createMockNext();


      await validateUniqueNIT(req, res, next);


      expect(next).toHaveBeenCalled();

      expect(Clinic.findOne).not.toHaveBeenCalled();
    });


    it('debe rechazar un NIT duplicado', async () => {

      const req = createMockReq({
        nit: '900123456-1',
      });

      const res = createMockRes();

      const next = createMockNext();


      (Clinic.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        nit: '900123456-1',
      });


      await validateUniqueNIT(req, res, next);


      expect(Clinic.findOne).toHaveBeenCalledWith({
        where: {
          nit: '900123456-1',
        },
      });


      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Ya existe una clínica con ese NIT',
      });

      expect(next).not.toHaveBeenCalled();
    });


    it('debe continuar si el NIT no está duplicado', async () => {

      const req = createMockReq({
        nit: '900999999-9',
      });

      const res = createMockRes();

      const next = createMockNext();


      (Clinic.findOne as jest.Mock).mockResolvedValue(null);


      await validateUniqueNIT(req, res, next);


      expect(Clinic.findOne).toHaveBeenCalledWith({
        where: {
          nit: '900999999-9',
        },
      });

      expect(next).toHaveBeenCalled();
    });


    it('debe continuar si el NIT está vacío', async () => {

      const req = createMockReq({
        nit: '',
      });

      const res = createMockRes();

      const next = createMockNext();


      await validateUniqueNIT(req, res, next);


      expect(Clinic.findOne).not.toHaveBeenCalled();

      expect(next).toHaveBeenCalled();
    });

  });

});


// ============================================================
// ERROR MIDDLEWARE
// ============================================================

describe('Error Middleware', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });


  it('notFoundHandler debe retornar 404', () => {

    const req = {} as Request;

    const res = createMockRes();


    notFoundHandler(req, res);


    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Ruta no encontrada',
    });
  });


  it('errorHandler debe retornar 500', () => {

    // Evita que Jest muestre el console.error
    // del middleware como salida roja.
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});


    const err = new Error('Error de prueba');

    const req = {} as Request;

    const res = createMockRes();

    const next = createMockNext();


    errorHandler(
      err,
      req,
      res,
      next,
    );


    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error no controlado:',
      'Error de prueba',
    );


    expect(res.status).toHaveBeenCalledWith(500);


    expect(res.json).toHaveBeenCalledWith({
      message: 'Error interno del servidor',
      error: undefined,
    });


    expect(next).not.toHaveBeenCalled();


    consoleErrorSpy.mockRestore();
  });

});