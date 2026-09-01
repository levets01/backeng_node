import User from '../models/User';
import { CreateUserDTO, UserRole } from '../types';

/**
 * User Repository
 * Encapsulates all database operations related to users
 */
export const userRepository = {
  /**
   * Finds a user by email address
   * @param email - User email
   * @returns Promise with found user or null
   */
  async findByEmail(email: string) {
    return User.findOne({ where: { email } });
  },

  /**
   * Finds a user by ID
   * @param id - User ID
   * @returns Promise with found user or null
   */
  async findById(id: number) {
    return User.findByPk(id);
  },

  /**
   * Retrieves all active users without password fields
   * @returns Promise with list of active users
   */
  async findAllActive() {
    return User.findAll({
      where: { isActive: true },
      attributes: { exclude: ['password'] },
    });
  },

  /**
   * Creates a new user in the database
   * @param data - Object with user data (name, email, password, role)
   * @returns Promise with created user
   */
  async create(data: CreateUserDTO) {
    return User.create(data as any);
  },

  /**
   * Finds an active user by email address
   * @param email - User email
   * @returns Promise with found active user or null
   */
  async findActiveByEmail(email: string) {
    return User.findOne({ where: { email, isActive: true } });
  },
};