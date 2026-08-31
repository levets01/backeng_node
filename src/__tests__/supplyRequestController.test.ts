jest.mock('../config/database', () => ({
  default: {
    authenticate: jest.fn(),
  },
}));

jest.mock('../models', () => ({}));

/* ============================================================
   SUPPLY REQUEST
   ============================================================ */

const mockSupplyRequestFindAll = jest.fn();
const mockSupplyRequestFindOne = jest.fn();
const mockSupplyRequestCreate = jest.fn();

jest.mock('../models/SupplyRequest', () => ({
  __esModule: true,
  default: {
    findAll: (...args: any[]) => mockSupplyRequestFindAll(...args),
    findOne: (...args: any[]) => mockSupplyRequestFindOne(...args),
    create: (...args: any[]) => mockSupplyRequestCreate(...args),
  },
}));

/* ============================================================
   CLINIC
   ============================================================ */

const mockClinicFindOne = jest.fn();

jest.mock('../models/Clinic', () => ({
  __esModule: true,
  default: {
    findOne: (...args: any[]) => mockClinicFindOne(...args),
  },
}));

/* ============================================================
   WAREHOUSE
   ============================================================ */

const mockWarehouseFindOne = jest.fn();

jest.mock('../models/Warehouse', () => ({
  __esModule: true,
  default: {
    findOne: (...args: any[]) => mockWarehouseFindOne(...args),
  },
}));

/* ============================================================
   MEDICATION
   ============================================================ */

const mockMedicationFindOne = jest.fn();

jest.mock('../models/Medication', () => ({
  __esModule: true,
  default: {
    findOne: (...args: any[]) => mockMedicationFindOne(...args),
  },
}));

/* ============================================================
   WAREHOUSE MEDICATION
   ============================================================ */

const mockWarehouseMedicationFindOne = jest.fn();

jest.mock('../models/WarehouseMedication', () => ({
  __esModule: true,
  default: {
    findOne: (...args: any[]) => mockWarehouseMedicationFindOne(...args),
  },
}));

/* ============================================================
   USER
   ============================================================ */

const mockUserFindOne = jest.fn();

jest.mock('../models/User', () => ({
  __esModule: true,
  default: {
    findOne: (...args: any[]) => mockUserFindOne(...args),
  },
}));

/* ============================================================
   CONTROLLER
   ============================================================ */

import {
  getSupplyRequests,
  getSupplyRequestById,
  createSupplyRequest,
  updateSupplyRequestStatus,
  getRequestHistoryByClinic,
  deleteSupplyRequest,
} from '../controllers/supplyRequest.controller';

/* ============================================================
   MOCK REQUEST
   ============================================================ */

const createMockReq = (
  body: any = {},
  params: any = {}
): any => ({
  body,
  params,
  user: {
    id: 1,
    role: 'admin',
  },
});

/* ============================================================
   MOCK RESPONSE
   ============================================================ */

const createMockRes = (): any => {
  const res: any = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

/* ============================================================
   TESTS
   ============================================================ */

describe('Supply Request Controller', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ==========================================================
     GET SUPPLY REQUESTS
     ========================================================== */

  it('getSupplyRequests debe retornar lista de solicitudes', async () => {

    mockSupplyRequestFindAll.mockResolvedValue([
      {
        id: 1,
        clinicId: 1,
        medicationId: 1,
        quantity: 50,
        warehouseId: 1,
        status: 'pendiente',
      },
    ]);

    const res = createMockRes();

    await getSupplyRequests(createMockReq(), res);

    expect(mockSupplyRequestFindAll).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalled();
  });

  /* ==========================================================
     GET SUPPLY REQUEST BY ID
     ========================================================== */

  it('getSupplyRequestById debe retornar 404 si no existe', async () => {

    mockSupplyRequestFindOne.mockResolvedValue(null);

    const res = createMockRes();

    await getSupplyRequestById(
      createMockReq({}, { id: '999' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('getSupplyRequestById debe retornar solicitud si existe', async () => {

    mockSupplyRequestFindOne.mockResolvedValue({
      id: 1,
      clinicId: 1,
      medicationId: 1,
      quantity: 50,
      warehouseId: 1,
      status: 'pendiente',
    });

    const res = createMockRes();

    await getSupplyRequestById(
      createMockReq({}, { id: '1' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalled();
  });

  /* ==========================================================
     CREACIÓN DE SOLICITUD
     FUNCIONALIDAD CRÍTICA #1
     ========================================================== */

  it('createSupplyRequest debe crear una solicitud correctamente', async () => {

    mockClinicFindOne.mockResolvedValue({
      id: 1,
      name: 'Clínica San Rafael',
      nit: '900123456-1',
      isActive: true,
    });

    mockMedicationFindOne.mockResolvedValue({
      id: 1,
      name: 'Paracetamol 500mg',
      unitPrice: 2500,
      isActive: true,
    });

    mockWarehouseFindOne.mockResolvedValue({
      id: 1,
      name: 'Almacén Central Bogotá',
      location: 'Zona Industrial, Bogotá',
      isActive: true,
    });

    const mockStockRecord = {
      warehouseId: 1,
      medicationId: 1,
      stock: 500,
      isActive: true,
      update: jest.fn().mockResolvedValue(true),
    };

    mockWarehouseMedicationFindOne.mockResolvedValue(mockStockRecord);

    mockSupplyRequestCreate.mockResolvedValue({
      id: 1,
      clinicId: 1,
      medicationId: 1,
      quantity: 50,
      warehouseId: 1,
      requestedById: 1,
      status: 'pendiente',
    });

    const res = createMockRes();

    await createSupplyRequest(
      createMockReq({
        clinicId: 1,
        medicationId: 1,
        quantity: 50,
        warehouseId: 1,
      }),
      res
    );

    /* Se comprobó que se actualizó el stock */
    expect(mockStockRecord.update).toHaveBeenCalledWith({
      stock: 450,
    });

    /* Se comprobó que se creó la solicitud */
    expect(mockSupplyRequestCreate).toHaveBeenCalledWith({
      clinicId: 1,
      medicationId: 1,
      quantity: 50,
      warehouseId: 1,
      requestedById: 1,
      status: 'pendiente',
    });

    /* Respuesta HTTP */
    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalled();
  });

  /* ==========================================================
     CREACIÓN - CANTIDAD INVÁLIDA
     ========================================================== */

  it('createSupplyRequest debe rechazar una cantidad menor o igual a cero', async () => {

    const res = createMockRes();

    await createSupplyRequest(
      createMockReq({
        clinicId: 1,
        medicationId: 1,
        quantity: 0,
        warehouseId: 1,
      }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: 'La cantidad debe ser mayor a cero',
    });

    expect(mockSupplyRequestCreate).not.toHaveBeenCalled();
  });

  /* ==========================================================
     CREACIÓN - CLÍNICA NO EXISTE
     ========================================================== */

  it('createSupplyRequest debe retornar 404 si la clínica no existe', async () => {

    mockClinicFindOne.mockResolvedValue(null);

    const res = createMockRes();

    await createSupplyRequest(
      createMockReq({
        clinicId: 999,
        medicationId: 1,
        quantity: 50,
        warehouseId: 1,
      }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Clínica no encontrada',
    });
  });

  /* ==========================================================
     CREACIÓN - MEDICAMENTO NO EXISTE
     ========================================================== */

  it('createSupplyRequest debe retornar 404 si el medicamento no existe', async () => {

    mockClinicFindOne.mockResolvedValue({
      id: 1,
      isActive: true,
    });

    mockMedicationFindOne.mockResolvedValue(null);

    const res = createMockRes();

    await createSupplyRequest(
      createMockReq({
        clinicId: 1,
        medicationId: 999,
        quantity: 50,
        warehouseId: 1,
      }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Medicamento no encontrado',
    });
  });

  /* ==========================================================
     CREACIÓN - ALMACÉN NO EXISTE
     ========================================================== */

  it('createSupplyRequest debe retornar 404 si el almacén no existe', async () => {

    mockClinicFindOne.mockResolvedValue({
      id: 1,
      isActive: true,
    });

    mockMedicationFindOne.mockResolvedValue({
      id: 1,
      isActive: true,
    });

    mockWarehouseFindOne.mockResolvedValue(null);

    const res = createMockRes();

    await createSupplyRequest(
      createMockReq({
        clinicId: 1,
        medicationId: 1,
        quantity: 50,
        warehouseId: 999,
      }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Almacén no encontrado',
    });
  });

  /* ==========================================================
     CREACIÓN - STOCK INSUFICIENTE
     ========================================================== */

  it('createSupplyRequest debe rechazar si no hay stock suficiente', async () => {

    mockClinicFindOne.mockResolvedValue({
      id: 1,
      isActive: true,
    });

    mockMedicationFindOne.mockResolvedValue({
      id: 1,
      isActive: true,
    });

    mockWarehouseFindOne.mockResolvedValue({
      id: 1,
      isActive: true,
    });

    mockWarehouseMedicationFindOne.mockResolvedValue({
      stock: 10,
      isActive: true,
    });

    const res = createMockRes();

    await createSupplyRequest(
      createMockReq({
        clinicId: 1,
        medicationId: 1,
        quantity: 50,
        warehouseId: 1,
      }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Stock insuficiente. Disponible: 10, Solicitado: 50',
    });

    expect(mockSupplyRequestCreate).not.toHaveBeenCalled();
  });

  /* ==========================================================
     CAMBIO DE ESTADO
     FUNCIONALIDAD CRÍTICA #2
     ========================================================== */

  it('updateSupplyRequestStatus debe cambiar de pendiente a en_proceso', async () => {

    const mockSupplyRequest = {
      id: 1,
      status: 'pendiente',
      isActive: true,
      update: jest.fn().mockResolvedValue(true),
    };

    mockSupplyRequestFindOne.mockResolvedValue(mockSupplyRequest);

    const res = createMockRes();

    await updateSupplyRequestStatus(
      createMockReq(
        {
          status: 'en_proceso',
        },
        {
          id: '1',
        }
      ),
      res
    );

    expect(mockSupplyRequest.update).toHaveBeenCalledWith({
      status: 'en_proceso',
    });

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalled();
  });

  /* ==========================================================
     CAMBIO DE ESTADO - TRANSICIÓN INVÁLIDA
     ========================================================== */

  it('updateSupplyRequestStatus debe rechazar una transición inválida', async () => {

    const mockSupplyRequest = {
      id: 1,
      status: 'pendiente',
      isActive: true,
    };

    mockSupplyRequestFindOne.mockResolvedValue(mockSupplyRequest);

    const res = createMockRes();

    await updateSupplyRequestStatus(
      createMockReq(
        {
          status: 'completada',
        },
        {
          id: '1',
        }
      ),
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: 'No se puede cambiar de estado "pendiente" a "completada"',
      allowedTransitions: ['en_proceso', 'cancelada'],
    });
  });

  /* ==========================================================
     CAMBIO DE ESTADO - NO EXISTE
     ========================================================== */

  it('updateSupplyRequestStatus debe retornar 404 si la solicitud no existe', async () => {

    mockSupplyRequestFindOne.mockResolvedValue(null);

    const res = createMockRes();

    await updateSupplyRequestStatus(
      createMockReq(
        {
          status: 'en_proceso',
        },
        {
          id: '999',
        }
      ),
      res
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });

  /* ==========================================================
     HISTORIAL POR CLÍNICA
     ========================================================== */

  it('getRequestHistoryByClinic debe retornar historial de la clínica', async () => {

    mockClinicFindOne.mockResolvedValue({
      id: 1,
      name: 'Clínica San Rafael',
      nit: '900123456-1',
      isActive: true,
    });

    mockSupplyRequestFindAll.mockResolvedValue([
      {
        id: 1,
        clinicId: 1,
        medicationId: 1,
        quantity: 50,
        status: 'pendiente',
      },
    ]);

    const res = createMockRes();

    const { getRequestHistoryByClinic } =
      require('../controllers/supplyRequest.controller');

    await getRequestHistoryByClinic(
      createMockReq({}, { clinicId: '1' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalled();
  });

  /* ==========================================================
     DELETE
     ========================================================== */

  it('deleteSupplyRequest debe eliminar lógicamente la solicitud', async () => {

    const mockSupplyRequest = {
      id: 1,
      isActive: true,
      update: jest.fn().mockResolvedValue(true),
    };

    mockSupplyRequestFindOne.mockResolvedValue(mockSupplyRequest);

    const res = createMockRes();

    await deleteSupplyRequest(
      createMockReq({}, { id: '1' }),
      res
    );

    expect(mockSupplyRequest.update).toHaveBeenCalledWith({
      isActive: false,
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  /* ==========================================================
     DELETE - NO EXISTE
     ========================================================== */

  it('deleteSupplyRequest debe retornar 404 si no existe', async () => {

    mockSupplyRequestFindOne.mockResolvedValue(null);

    const res = createMockRes();

    await deleteSupplyRequest(
      createMockReq({}, { id: '999' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });

});