jest.mock('../config/database', () => ({
  default: {
    authenticate: jest.fn(),
  },
}));

jest.mock('../models', () => ({}));

const mockMedicationFindAll = jest.fn();
const mockMedicationFindOne = jest.fn();
const mockMedicationCreate = jest.fn();

jest.mock('../models/Medication', () => ({
  __esModule: true,
  default: {
    findAll: (...args: any[]) => mockMedicationFindAll(...args),
    findOne: (...args: any[]) => mockMedicationFindOne(...args),
    create: (...args: any[]) => mockMedicationCreate(...args),
  },
}));

const mockWarehouseMedicationFindOne = jest.fn();
const mockWarehouseMedicationFindOrCreate = jest.fn();

jest.mock('../models/WarehouseMedication', () => ({
  __esModule: true,
  default: {
    findOne: (...args: any[]) => mockWarehouseMedicationFindOne(...args),
    findOrCreate: (...args: any[]) =>
      mockWarehouseMedicationFindOrCreate(...args),
  },
}));

const mockWarehouseFindOne = jest.fn();

jest.mock('../models/Warehouse', () => ({
  __esModule: true,
  default: {
    findOne: (...args: any[]) => mockWarehouseFindOne(...args),
  },
}));

import {
  getMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  assignStock,
} from '../controllers/medication.controller';

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

describe('Medication Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =====================================================
  // GET MEDICATIONS
  // =====================================================

  it('getMedications debe retornar lista de medicamentos', async () => {
    mockMedicationFindAll.mockResolvedValue([
      {
        id: 1,
        name: 'Paracetamol 500mg',
        unitPrice: 2500,
        isActive: true,
      },
    ]);

    const res = createMockRes();

    await getMedications(createMockReq(), res);

    expect(mockMedicationFindAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        id: 1,
        name: 'Paracetamol 500mg',
        unitPrice: 2500,
        isActive: true,
      },
    ]);
  });

  it('getMedications debe retornar 500 si ocurre un error', async () => {
    mockMedicationFindAll.mockRejectedValue(
      new Error('Error de base de datos'),
    );

    const res = createMockRes();

    await getMedications(createMockReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =====================================================
  // GET MEDICATION BY ID
  // =====================================================

  it('getMedicationById debe retornar 404 si no existe', async () => {
    mockMedicationFindOne.mockResolvedValue(null);

    const res = createMockRes();

    await getMedicationById(
      createMockReq({}, { id: '999' }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('getMedicationById debe retornar medicamento si existe', async () => {
    const medication = {
      id: 1,
      name: 'Paracetamol 500mg',
      unitPrice: 2500,
    };

    mockMedicationFindOne.mockResolvedValue(medication);

    const res = createMockRes();

    await getMedicationById(
      createMockReq({}, { id: '1' }),
      res,
    );

    expect(mockMedicationFindOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(medication);
  });

  // =====================================================
  // CREATE MEDICATION
  // =====================================================

  it('createMedication debe crear un medicamento', async () => {
    const medication = {
      id: 1,
      name: 'Paracetamol 500mg',
      description: 'Analgésico',
      unitPrice: 2500,
    };

    mockMedicationCreate.mockResolvedValue(medication);

    const res = createMockRes();

    await createMedication(
      createMockReq({
        name: 'Paracetamol 500mg',
        description: 'Analgésico',
        unitPrice: 2500,
      }),
      res,
    );

    expect(mockMedicationCreate).toHaveBeenCalledWith({
      name: 'Paracetamol 500mg',
      description: 'Analgésico',
      unitPrice: 2500,
    });

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('createMedication debe retornar 500 si ocurre un error', async () => {
    mockMedicationCreate.mockRejectedValue(
      new Error('Error creando medicamento'),
    );

    const res = createMockRes();

    await createMedication(
      createMockReq({
        name: 'Paracetamol',
        description: 'Analgésico',
        unitPrice: 2500,
      }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =====================================================
  // UPDATE MEDICATION
  // =====================================================

  it('updateMedication debe retornar 404 si no existe', async () => {
    mockMedicationFindOne.mockResolvedValue(null);

    const res = createMockRes();

    await updateMedication(
      createMockReq(
        { name: 'Nuevo nombre' },
        { id: '999' },
      ),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('updateMedication debe actualizar un medicamento', async () => {
    const mockMedication = {
      id: 1,
      name: 'Paracetamol',
      update: jest.fn().mockResolvedValue(true),
    };

    mockMedicationFindOne.mockResolvedValue(mockMedication);

    const res = createMockRes();

    await updateMedication(
      createMockReq(
        { name: 'Paracetamol 500mg' },
        { id: '1' },
      ),
      res,
    );

    expect(mockMedication.update).toHaveBeenCalledWith({
      name: 'Paracetamol 500mg',
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // =====================================================
  // DELETE MEDICATION
  // =====================================================

  it('deleteMedication debe retornar 404 si no existe', async () => {
    mockMedicationFindOne.mockResolvedValue(null);

    const res = createMockRes();

    await deleteMedication(
      createMockReq({}, { id: '999' }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deleteMedication debe eliminar lógicamente el medicamento', async () => {
    const mockMedication = {
      id: 1,
      name: 'Paracetamol',
      update: jest.fn().mockResolvedValue(true),
    };

    mockMedicationFindOne.mockResolvedValue(mockMedication);

    const res = createMockRes();

    await deleteMedication(
      createMockReq({}, { id: '1' }),
      res,
    );

    expect(mockMedication.update).toHaveBeenCalledWith({
      isActive: false,
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // =====================================================
  // ASSIGN STOCK
  // =====================================================

  it('assignStock debe rechazar stock negativo', async () => {
    const res = createMockRes();

    await assignStock(
      createMockReq({
        warehouseId: 1,
        medicationId: 1,
        stock: -10,
      }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: 'El stock no puede ser negativo',
    });
  });

  it('assignStock debe retornar 404 si el almacén no existe', async () => {
    mockWarehouseFindOne.mockResolvedValue(null);

    const res = createMockRes();

    await assignStock(
      createMockReq({
        warehouseId: 999,
        medicationId: 1,
        stock: 100,
      }),
      res,
    );

    expect(mockWarehouseFindOne).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('assignStock debe retornar 404 si el medicamento no existe', async () => {
    mockWarehouseFindOne.mockResolvedValue({
      id: 1,
      name: 'Almacén Central',
    });

    mockMedicationFindOne.mockResolvedValue(null);

    const res = createMockRes();

    await assignStock(
      createMockReq({
        warehouseId: 1,
        medicationId: 999,
        stock: 100,
      }),
      res,
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('assignStock debe crear stock si no existe', async () => {
    const warehouse = {
      id: 1,
      name: 'Almacén Central',
    };

    const medication = {
      id: 1,
      name: 'Paracetamol',
    };

    const warehouseMedication = {
      id: 1,
      warehouseId: 1,
      medicationId: 1,
      stock: 100,
    };

    mockWarehouseFindOne.mockResolvedValue(warehouse);
    mockMedicationFindOne.mockResolvedValue(medication);

    mockWarehouseMedicationFindOrCreate.mockResolvedValue([
      warehouseMedication,
      true,
    ]);

    const res = createMockRes();

    await assignStock(
      createMockReq({
        warehouseId: 1,
        medicationId: 1,
        stock: 100,
      }),
      res,
    );

    expect(mockWarehouseMedicationFindOrCreate).toHaveBeenCalledWith({
      where: {
        warehouseId: 1,
        medicationId: 1,
      },
      defaults: {
        warehouseId: 1,
        medicationId: 1,
        stock: 100,
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('assignStock debe actualizar stock existente', async () => {
    const mockStock = {
      id: 1,
      warehouseId: 1,
      medicationId: 1,
      stock: 100,
      update: jest.fn().mockResolvedValue(true),
    };

    mockWarehouseFindOne.mockResolvedValue({
      id: 1,
      name: 'Almacén Central',
    });

    mockMedicationFindOne.mockResolvedValue({
      id: 1,
      name: 'Paracetamol',
    });

    mockWarehouseMedicationFindOrCreate.mockResolvedValue([
      mockStock,
      false,
    ]);

    const res = createMockRes();

    await assignStock(
      createMockReq({
        warehouseId: 1,
        medicationId: 1,
        stock: 200,
      }),
      res,
    );

    expect(mockStock.update).toHaveBeenCalledWith({
      stock: 200,
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });
});