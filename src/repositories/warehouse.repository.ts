import Warehouse from '../models/Warehouse';
import User from '../models/User';

/**
 * Warehouse Repository
 * Encapsulates all database operations related to warehouses
 */
export const warehouseRepository = {
  /**
   * Retrieves all active warehouses
   * @returns Promise with list of warehouses including responsible user data
   */
  async findAll() {
    return Warehouse.findAll({
      where: { isActive: true },
      include: [{ model: User, as: 'responsible', attributes: ['id', 'name', 'email'] }],
    });
  },

  /**
   * Retrieves a specific warehouse by ID
   * @param id - Warehouse ID
   * @returns Promise with found warehouse or null
   */
  async findById(id: number) {
    return Warehouse.findOne({
      where: { id, isActive: true },
      include: [{ model: User, as: 'responsible', attributes: ['id', 'name', 'email'] }],
    });
  },

  /**
   * Creates a new warehouse in the database
   * @param data - Object with warehouse data (name, location, responsibleId)
   * @returns Promise with created warehouse
   */
  async create(data: any) {
    return Warehouse.create(data);
  },

  /**
   * Updates an existing warehouse
   * @param id - Warehouse ID to update
   * @param data - Object with data to update
   * @returns Promise with updated warehouse or null if not found
   */
  async update(id: number, data: any) {
    const warehouse = await Warehouse.findOne({ where: { id, isActive: true } });
    if (!warehouse) return null;
    return warehouse.update(data);
  },

  /**
   * Soft deletes an existing warehouse
   * Marks the warehouse as inactive without physically removing it from the database
   * @param id - Warehouse ID to delete
   * @returns Promise with deleted warehouse or null if not found
   */
  async delete(id: number) {
    const warehouse = await Warehouse.findOne({ where: { id, isActive: true } });
    if (!warehouse) return null;
    return warehouse.update({ isActive: false });
  },
};
