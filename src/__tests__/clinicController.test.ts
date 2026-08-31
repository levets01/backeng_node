jest.mock('../config/database', () => ({ default: { authenticate: jest.fn() } }));
jest.mock('../models', () => ({}));

const mockClinicFindOne = jest.fn();
const mockClinicFindAll = jest.fn();
const mockClinicCreate = jest.fn();
const mockClinicUpdate = jest.fn();

jest.mock('../models/Clinic', () => ({
  __esModule: true,
  default: {
    findOne: (...a: any[]) => mockClinicFindOne(...a),
    findAll: (...a: any[]) => mockClinicFindAll(...a),
    create: (...a: any[]) => mockClinicCreate(...a),
  },
}));

const mockUserFindOne = jest.fn();
jest.mock('../models/User', () => ({
  __esModule: true,
  default: {
    findOne: (...a: any[]) => mockUserFindOne(...a),
  },
}));

import { getClinics, getClinicById, createClinic, updateClinic, deleteClinic } from '../controllers/clinic.controller';

const createMockReq = (body: any = {}, params: any = {}): any => ({ body, params, user: { id: 1, role: 'admin' } });
const createMockRes = (): any => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Clinic Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getClinics debe retornar lista de clínicas', async () => {
    mockClinicFindAll.mockResolvedValue([{ id: 1, name: 'Clinic1', nit: '123' }]);
    const res = createMockRes();
    await getClinics(createMockReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getClinicById debe retornar 404 si no existe', async () => {
    mockClinicFindOne.mockResolvedValue(null);
    const res = createMockRes();
    await getClinicById(createMockReq({}, { id: '999' }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('getClinicById debe retornar la clínica si existe', async () => {
    mockClinicFindOne.mockResolvedValue({ id: 1, name: 'Clinic1' });
    const res = createMockRes();
    await getClinicById(createMockReq({}, { id: '1' }), res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('createClinic debe crear una clínica', async () => {
    mockClinicFindOne.mockResolvedValue(null);
    mockUserFindOne.mockResolvedValue({ id: 1 });
    mockClinicCreate.mockResolvedValue({ id: 1, name: 'New', nit: '456' });
    const res = createMockRes();
    await createClinic(createMockReq({ name: 'New', nit: '456', address: 'Addr', phone: '123', responsibleId: 1 }), res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('createClinic debe rechazar NIT duplicado', async () => {
    mockClinicFindOne.mockResolvedValue({ id: 1, nit: '456' });
    const res = createMockRes();
    await createClinic(createMockReq({ name: 'Dup', nit: '456', address: 'Addr', phone: '123', responsibleId: 1 }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('createClinic debe rechazar responsable inexistente', async () => {
    mockClinicFindOne.mockResolvedValue(null);
    mockUserFindOne.mockResolvedValue(null);
    const res = createMockRes();
    await createClinic(createMockReq({ name: 'New', nit: '789', address: 'Addr', phone: '123', responsibleId: 999 }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updateClinic debe retornar 404 si no existe', async () => {
    mockClinicFindOne.mockResolvedValue(null);
    const res = createMockRes();
    await updateClinic(createMockReq({ name: 'Updated' }, { id: '999' }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('updateClinic debe actualizar la clínica', async () => {
    const mockClinic = { id: 1, nit: '123', update: jest.fn() };
    mockClinicFindOne.mockResolvedValue(mockClinic);
    const res = createMockRes();
    await updateClinic(createMockReq({ name: 'Updated' }, { id: '1' }), res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deleteClinic debe eliminar lógicamente', async () => {
    const mockClinic = { id: 1, update: jest.fn() };
    mockClinicFindOne.mockResolvedValue(mockClinic);
    const res = createMockRes();
    await deleteClinic(createMockReq({}, { id: '1' }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockClinic.update).toHaveBeenCalledWith({ isActive: false });
  });

  it('deleteClinic debe retornar 404 si no existe', async () => {
    mockClinicFindOne.mockResolvedValue(null);
    const res = createMockRes();
    await deleteClinic(createMockReq({}, { id: '999' }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
