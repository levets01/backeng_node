
import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';

import sequelize from '../config/database';
import { UserRole } from '../types';

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User model.
 *
 * Represents system users and their authentication information.
 */
class User extends Model implements UserAttributes {
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: UserRole;
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;

  /**
   * Hashes the user's password using bcrypt.
   *
   * @returns A promise that resolves when the password has been hashed.
   */
  public async hashPassword(): Promise<void> {
    if (!this.password) {
      throw new Error('La contraseña es obligatoria');
    }

    this.password = await bcrypt.hash(this.password, 10);
  }

  /**
   * Validates a plain-text password against the stored hashed password.
   *
   * @param password - Plain-text password to validate.
   * @returns A promise that resolves to true if the password is valid, otherwise false.
   */
  public async validatePassword(
    password: string
  ): Promise<boolean> {
    if (!password || !this.password) {
      return false;
    }

    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM('admin', 'gestor'),
      allowNull: false,
      defaultValue: 'gestor',
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,

    hooks: {
      beforeCreate: async (user: User): Promise<void> => {
        await user.hashPassword();
      },

      beforeUpdate: async (user: User): Promise<void> => {
        if (user.changed('password')) {
          await user.hashPassword();
        }
      },
    },
  }
);

export default User;

