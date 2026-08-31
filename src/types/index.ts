import { Request } from 'express';

export type UserRole = 'admin' | 'gestor';

export type RequestStatus = 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';

export interface TokenPayload {
  id: number;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface CreateClinicDTO {
  name: string;
  nit: string;
  address: string;
  phone: string;
  responsibleId: number;
}

export interface CreateWarehouseDTO {
  name: string;
  location: string;
  responsibleId: number;
}

export interface CreateMedicationDTO {
  name: string;
  description: string;
  unitPrice: number;
}

export interface AssignStockDTO {
  warehouseId: number;
  medicationId: number;
  stock: number;
}

export interface CreateSupplyRequestDTO {
  clinicId: number;
  medicationId: number;
  quantity: number;
  warehouseId: number;
}

export interface UpdateRequestStatusDTO {
  status: RequestStatus;
}

export interface SeederPayload {
  users?: CreateUserDTO[];
  clinics?: CreateClinicDTO[];
  warehouses?: CreateWarehouseDTO[];
  medications?: CreateMedicationDTO[];
  stocks?: AssignStockDTO[];
  supplyRequests?: CreateSupplyRequestDTO[];
}
