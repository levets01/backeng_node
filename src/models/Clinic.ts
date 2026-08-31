
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

/**
 * Clinic model.
 *
 * Each clinic has a unique NIT and an assigned responsible user.
 */
class Clinic extends Model {
  public id!: number;
  public name!: string;
  public nit!: string;
  public address!: string;
  public phone!: string;
  public responsibleId!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Clinic.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    nit: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    responsibleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'clinics',
    timestamps: true,
  }
);

export default Clinic;

