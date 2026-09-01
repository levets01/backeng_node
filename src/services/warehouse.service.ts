import { warehouseRepository } from '../repositories/warehouse.repository';
import { userRepository } from '../repositories/user.repository';
import { CreateWarehouseDTO } from '../types';

/**
 * Warehouse Service
 * Contains business logic for warehouse operations
 */
export const warehouseService = {
  /**
   * Retrieves all active warehouses
   * @returns Promise with list of warehouses
   */
  async getAllWarehouses() {
    return warehouseRepository.findAll();
  },

  /**
   * Retrieves a specific warehouse by ID
   * @param id - Warehouse ID
   * @returns Promise with warehouse data
   * @throws Error if warehouse not found
   */
  async getWarehouseById(id: number) {
    const warehouse = await warehouseRepository.findById(id);
    if (!warehouse) {
      throw {
        status: 404,
        message: 'Warehouse not found',
      };
    }
    return warehouse;
  },

  /**
   * Creates a new warehouse with validations
   * Validates: required fields, responsible user exists
   * @param data - Warehouse creation data
   * @returns Promise with created warehouse
   * @throws Error if validation fails
   */
  async createWarehouse(data: CreateWarehouseDTO) {
    const { name, location, responsibleId } = data;

    // Validate required fields
    if (!name || !location || !responsibleId) {
      throw {
        status: 400,
        message: 'Name, location and responsible are required',
      };
    }

    // Validate responsible user exists and is active
    const responsible = await userRepository.findById(responsibleId);
    if (!responsible || !responsible.isActive) {
      throw {
        status: 400,
        message: 'The specified responsible user does not exist',
      };
    }

    return warehouseRepository.create({
      name,
      location,
      responsibleId,
    });
  },

  /**
   * Updates an existing warehouse with validations
   * @param id - Warehouse ID to update
   * @param data - Warehouse update data
   * @returns Promise with updated warehouse
   * @throws Error if validation fails
   */
  async updateWarehouse(id: number, data: Partial<CreateWarehouseDTO>) {
    const warehouse = await warehouseRepository.findById(id);
    if (!warehouse) {
      throw {
        status: 404,
        message: 'Warehouse not found',
      };
    }

    // Validate responsible user exists if being updated
    if (data.responsibleId) {
      const responsible = await userRepository.findById(data.responsibleId);
      if (!responsible || !responsible.isActive) {
        throw {
          status: 400,
          message: 'The specified responsible user does not exist',
        };
      }
    }

    return warehouseRepository.update(id, data);
  },

  /**
   * Soft deletes a warehouse
   * @param id - Warehouse ID to delete
   * @returns Promise with deleted warehouse
   * @throws Error if warehouse not found
   */
  async deleteWarehouse(id: number) {
    const warehouse = await warehouseRepository.findById(id);
    if (!warehouse) {
      throw {
        status: 404,
        message: 'Warehouse not found',
      };
    }
    return warehouseRepository.delete(id);
  },
};
