import User from '../models/User';
import { CreateUserDTO, UserRole } from '../types';

export const userRepository = {
  async findByEmail(email: string) {
    return User.findOne({ where: { email } });
  },

  async findById(id: number) {
    return User.findByPk(id);
  },

  async findAllActive() {
    return User.findAll({
      where: { isActive: true },
      attributes: { exclude: ['password'] },
    });
  },

  async create(data: CreateUserDTO) {
    return User.create(data as any);
  },

  async findActiveByEmail(email: string) {
    return User.findOne({ where: { email, isActive: true } });
  },
};