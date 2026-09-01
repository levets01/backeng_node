import SupplyRequest from '../models/SupplyRequest';
import Clinic from '../models/Clinic';
import Warehouse from '../models/Warehouse';
import Medication from '../models/Medication';
import User from '../models/User';

/**
 * Supply Request Repository
 * Encapsulates all database operations related to supply requests
 */
export const supplyRequestRepository = {
  /**
   * Retrieves all active supply requests
   * @returns Promise with list of supply requests including related clinic, warehouse, medication and user data
   */
  async findAll() {
    return SupplyRequest.findAll({
      where: { isActive: true },
      include: [
        { model: Clinic, as: 'clinic', attributes: ['id', 'name', 'nit'] },
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'location'] },
        { model: Medication, as: 'medication', attributes: ['id', 'name', 'unitPrice'] },
        { model: User, as: 'requestedBy', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });
  },

  /**
   * Retrieves a specific supply request by ID
   * @param id - Supply request ID
   * @returns Promise with found supply request or null
   */
  async findById(id: number) {
    return SupplyRequest.findOne({
      where: { id, isActive: true },
      include: [
        { model: Clinic, as: 'clinic', attributes: ['id', 'name', 'nit'] },
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'location'] },
        { model: Medication, as: 'medication', attributes: ['id', 'name', 'unitPrice'] },
        { model: User, as: 'requestedBy', attributes: ['id', 'name', 'email'] },
      ],
    });
  },

  /**
   * Creates a new supply request in the database
   * @param data - Object with supply request data (clinicId, medicationId, quantity, warehouseId, requestedById, status)
   * @returns Promise with created supply request
   */
  async create(data: any) {
    return SupplyRequest.create(data);
  },

  /**
   * Updates an existing supply request
   * @param id - Supply request ID to update
   * @param data - Object with data to update
   * @returns Promise with updated supply request or null if not found
   */
  async update(id: number, data: any) {
    const request = await SupplyRequest.findOne({ where: { id, isActive: true } });
    if (!request) return null;
    return request.update(data);
  },

  /**
   * Soft deletes an existing supply request
   * Marks the supply request as inactive without physically removing it from the database
   * @param id - Supply request ID to delete
   * @returns Promise with deleted supply request or null if not found
   */
  async delete(id: number) {
    const request = await SupplyRequest.findOne({ where: { id, isActive: true } });
    if (!request) return null;
    return request.update({ isActive: false });
  },
};
