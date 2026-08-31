jest.mock('../config/database', () => ({
  default: {
    authenticate: jest.fn(),
  },
}));

jest.mock('../models', () => ({}));

const mockWarehouseFindAll = jest.fn();
const mockWarehouseFindOne = jest.fn();
const mockWarehouseCreate = jest.fn();

jest.mock('../models/Warehouse', () => ({
  __esModule: true,
  default: {
    findAll: (...args: any[]) => mockWarehouseFindAll(...args),
    findOne: (...args: any[]) => mockWarehouseFindOne(...args),
    create: (...args: any[]) => mockWarehouseCreate(...args),
  },
}));

const mockUserFindOne = jest.fn();

jest.mock('../models/User', () => ({
  __esModule: true,
  default: {
    findOne: (...args: any[]) => mockUserFindOne(...args),
  },
}));

import {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from '../controllers/warehouse.controller';

const createMockReq = (
  body: any = {},
  params: any = {},
): any => ({
  body,
  params,
  user: {
    id: 1,
    role: 'admin',
  },
});

const createMockRes = (): any => {
  const res: any = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

describe('Warehouse Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =====================================================
  // GET WAREHOUSES
  // =====================================================

  it('getWarehouses debe retornar lista de almacenes', async () => {
    mockWarehouseFindAll.mockResolvedValue([
      {
        id: 1,
        name: 'Almacén Central Bogotá',
        location: 'Zona Industrial, Bogotá',
        responsibleId: 1,
        isActive: true,
      },
    ]);

    const res = createMockRes();

    await getWarehouses(createMockReq(), res);

    expect(mockWarehouseFindAll).toHaveBeenCalledWith({
      where: { isActive: true },
      include: [
        {
          model: expect.anything(),
          as: 'responsible',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getWarehouses debe retornar 500 si ocurre un error', async () => {
    mockWarehouseFindAll.mockRejectedValue(
      new Error('Error de base de datos'),
    );

    const res = createMockRes();

    await getWarehouses(createMockReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =====================================================
  // GET WAREHOUSE BY ID
  // =====================================================

  it('getWarehouseById debe retornar 404 si no existe', async () => {
    mockWarehouseFindOne.mockResolvedValue(null);

    const res = createMockRes();

    await getWarehouseById(
      createMockReq({}, { id: '999' }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('getWarehouseById debe retornar almacén si existe', async () => {
    const warehouse = {
      id: 1,
      name: 'Almacén Central Bogotá',
      location: 'Zona Industrial, Bogotá',
    };

    mockWarehouseFindOne.mockResolvedValue(warehouse);

    const res = createMockRes();

    await getWarehouseById(
      createMockReq({}, { id: '1' }),
      res,
    );

    expect(mockWarehouseFindOne).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(warehouse);
  });

  it('getWarehouseById debe retornar 500 si ocurre un error', async () => {
    mockWarehouseFindOne.mockRejectedValue(
      new Error('Error buscando almacén'),
    );

    const res = createMockRes();

    await getWarehouseById(
      createMockReq({}, { id: '1' }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =====================================================
  // CREATE WAREHOUSE
  // =====================================================

  it('createWarehouse debe crear un almacén', async () => {
    mockUserFindOne.mockResolvedValue({
      id: 1,
      name: 'Admin Principal',
      isActive: true,
    });

    const warehouse = {
      id: 1,
      name: 'Almacén Central Bogotá',
      location: 'Zona Industrial, Bogotá',
      responsibleId: 1,
    };

    mockWarehouseCreate.mockResolvedValue(warehouse);

    const res = createMockRes();

    await createWarehouse(
      createMockReq({
        name: 'Almacén Central Bogotá',
        location: 'Zona Industrial, Bogotá',
        responsibleId: 1,
      }),
      res,
    );

    expect(mockUserFindOne).toHaveBeenCalledWith({
      where: {
        id: 1,
        isActive: true,
      },
    });

    expect(mockWarehouseCreate).toHaveBeenCalledWith({
      name: 'Almacén Central Bogotá',
      location: 'Zona Industrial, Bogotá',
      responsibleId: 1,
    });

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('createWarehouse debe rechazar responsable inexistente', async () => {
    mockUserFindOne.mockResolvedValue(null);

    const res = createMockRes();

    await createWarehouse(
      createMockReq({
        name: 'Almacén Nuevo',
        location: 'Bogotá',
        responsibleId: 999,
      }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: 'El responsable especificado no existe',
    });

    expect(mockWarehouseCreate).not.toHaveBeenCalled();
  });

  it('createWarehouse debe retornar 500 si ocurre un error', async () => {
    mockUserFindOne.mockRejectedValue(
      new Error('Error de base de datos'),
    );

    const res = createMockRes();

    await createWarehouse(
      createMockReq({
        name: 'Almacén Nuevo',
        location: 'Bogotá',
        responsibleId: 1,
      }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =====================================================
  // UPDATE WAREHOUSE
  // =====================================================

  it('updateWarehouse debe retornar 404 si no existe', async () => {
    mockWarehouseFindOne.mockResolvedValue(null);

    const res = createMockRes();

    await updateWarehouse(
      createMockReq(
        { name: 'Almacén actualizado' },
        { id: '999' },
      ),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('updateWarehouse debe actualizar un almacén', async () => {
    const mockWarehouse = {
      id: 1,
      name: 'Almacén Central',
      update: jest.fn().mockResolvedValue(true),
    };

    mockWarehouseFindOne.mockResolvedValue(mockWarehouse);

    const res = createMockRes();

    await updateWarehouse(
      createMockReq(
        { name: 'Almacén Central Actualizado' },
        { id: '1' },
      ),
      res,
    );

    expect(mockWarehouse.update).toHaveBeenCalledWith({
      name: 'Almacén Central Actualizado',
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updateWarehouse debe retornar 500 si ocurre un error', async () => {
    mockWarehouseFindOne.mockRejectedValue(
      new Error('Error actualizando almacén'),
    );

    const res = createMockRes();

    await updateWarehouse(
      createMockReq(
        { name: 'Nuevo nombre' },
        { id: '1' },
      ),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =====================================================
  // DELETE WAREHOUSE
  // =====================================================

  it('deleteWarehouse debe retornar 404 si no existe', async () => {
    mockWarehouseFindOne.mockResolvedValue(null);

    const res = createMockRes();

    await deleteWarehouse(
      createMockReq({}, { id: '999' }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deleteWarehouse debe eliminar lógicamente el almacén', async () => {
    const mockWarehouse = {
      id: 1,
      name: 'Almacén Central',
      update: jest.fn().mockResolvedValue(true),
    };

    mockWarehouseFindOne.mockResolvedValue(mockWarehouse);

    const res = createMockRes();

    await deleteWarehouse(
      createMockReq({}, { id: '1' }),
      res,
    );

    expect(mockWarehouse.update).toHaveBeenCalledWith({
      isActive: false,
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deleteWarehouse debe retornar 500 si ocurre un error', async () => {
    mockWarehouseFindOne.mockRejectedValue(
      new Error('Error eliminando almacén'),
    );

    const res = createMockRes();

    await deleteWarehouse(
      createMockReq({}, { id: '1' }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(500);
  });
});