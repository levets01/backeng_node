
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { RequestStatus } from '../types';

/**
 * Supply request model.
 *
 * Records medication supply requests made by clinics.
 */
class SupplyRequest extends Model {
  public id!: number;
  public clinicId!: number;
  public warehouseId!: number;
  public medicationId!: number;
  public quantity!: number;
  public status!: RequestStatus;
  public requestedById!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SupplyRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clinicId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clinics',
        key: 'id',
      },
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'warehouses',
        key: 'id',
      },
    },
    medicationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'medications',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    status: {
      type: DataTypes.ENUM('pendiente', 'en_proceso', 'completada', 'cancelada'),
      allowNull: false,
      defaultValue: 'pendiente',
    },
    requestedById: {
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
    tableName: 'supply_requests',
    timestamps: true,
  }
);

export default SupplyRequest;

