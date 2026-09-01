import { supplyRequestRepository } from '../repositories/supplyRequest.repository';
import { clinicRepository } from '../repositories/clinic.repository';
import { medicationRepository } from '../repositories/medication.repository';
import { warehouseRepository } from '../repositories/warehouse.repository';
import { CreateSupplyRequestDTO, UpdateRequestStatusDTO, RequestStatus } from '../types';
import WarehouseMedication from '../models/WarehouseMedication';
import Clinic from '../models/Clinic';
import SupplyRequest from '../models/SupplyRequest';

/**
 * Valid state transitions for supply requests
 * Defines allowed status changes in the workflow
 */
const VALID_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  pendiente: ['en_proceso', 'cancelada'],
  en_proceso: ['completada', 'cancelada'],
  completada: [],
  cancelada: [],
};

/**
 * Supply Request Service
 * Contains business logic for supply request operations
 */
export const supplyRequestService = {
  /**
   * Retrieves all active supply requests
   * @returns Promise with list of supply requests
   */
  async getAllRequests() {
    return supplyRequestRepository.findAll();
  },

  /**
   * Retrieves a specific supply request by ID
   * @param id - Supply request ID
   * @returns Promise with supply request data
   * @throws Error if supply request not found
   */
  async getRequestById(id: number) {
    const request = await supplyRequestRepository.findById(id);
    if (!request) {
      throw {
        status: 404,
        message: 'Supply request not found',
      };
    }
    return request;
  },

  /**
   * Creates a new supply request with validations
   * Validates: quantity, clinic exists, medication exists, warehouse exists, stock availability
   * Deducts stock from warehouse medication inventory
   * @param data - Supply request creation data
   * @param userId - ID of the user making the request
   * @returns Promise with created supply request
   * @throws Error if validation fails
   */
  async createRequest(data: CreateSupplyRequestDTO, userId: number) {
    const { clinicId, medicationId, quantity, warehouseId } = data;

    // Validate quantity is positive
    if (quantity <= 0) {
      throw {
        status: 400,
        message: 'Quantity must be greater than zero',
      };
    }

    // Validate clinic exists
    const clinic = await clinicRepository.findById(clinicId);
    if (!clinic) {
      throw {
        status: 404,
        message: 'Clinic not found',
      };
    }

    // Validate medication exists
    const medication = await medicationRepository.findById(medicationId);
    if (!medication) {
      throw {
        status: 404,
        message: 'Medication not found',
      };
    }

    // Validate warehouse exists
    const warehouse = await warehouseRepository.findById(warehouseId);
    if (!warehouse) {
      throw {
        status: 404,
        message: 'Warehouse not found',
      };
    }

    // Validate stock availability
    const stockRecord = await WarehouseMedication.findOne({
      where: { warehouseId, medicationId, isActive: true },
    });

    if (!stockRecord || stockRecord.stock < quantity) {
      const available = stockRecord ? stockRecord.stock : 0;
      throw {
        status: 400,
        message: `Insufficient stock. Available: ${available}, Requested: ${quantity}`,
      };
    }

    // Deduct stock from warehouse
    await stockRecord.update({ stock: stockRecord.stock - quantity });

    // Create supply request
    return supplyRequestRepository.create({
      clinicId,
      medicationId,
      quantity,
      warehouseId,
      requestedById: userId,
      status: 'pendiente',
    });
  },

  /**
   * Updates the status of a supply request
   * Validates the status transition according to the state machine
   * @param id - Supply request ID to update
   * @param newStatus - New status to transition to
   * @returns Promise with updated supply request
   * @throws Error if status transition is not allowed
   */
  async updateRequestStatus(id: number, newStatus: RequestStatus) {
    const request = await supplyRequestRepository.findById(id);
    if (!request) {
      throw {
        status: 404,
        message: 'Supply request not found',
      };
    }

    const allowedTransitions = VALID_TRANSITIONS[request.status as RequestStatus];
    if (!allowedTransitions.includes(newStatus)) {
      throw {
        status: 400,
        message: `Cannot transition from status "${request.status}" to "${newStatus}"`,
        allowedTransitions,
      };
    }

    return supplyRequestRepository.update(id, { status: newStatus });
  },

  /**
   * Retrieves all supply requests for a specific clinic
   * @param clinicId - Clinic ID to get history for
   * @returns Promise with clinic data and its supply request history
   * @throws Error if clinic not found
   */
  async getRequestHistoryByClinic(clinicId: number) {
    // Verify clinic exists
    const clinic = await Clinic.findOne({ where: { id: clinicId, isActive: true } });
    if (!clinic) {
      throw {
        status: 404,
        message: 'Clínica no encontrada',
      };
    }

    const requests = await SupplyRequest.findAll({
      where: { clinicId, isActive: true },
    });

    return {
      clinic,
      requests,
    };
  },

  async deleteRequest(id: number) {
    const request = await supplyRequestRepository.findById(id);
    if (!request) {
      throw {
        status: 404,
        message: 'Solicitud no encontrada',
      };
    }
    return supplyRequestRepository.delete(id);
  },
};
