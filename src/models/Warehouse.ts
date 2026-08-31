
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

/**
 * Warehouse model.
 *
 * Each warehouse has an assigned responsible user and can contain
 * multiple medications with available stock.
 */
class Warehouse extends Model {
  public id!: number;
  public name!: string;
  public location!: string;
  public responsibleId!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Warehouse.init(
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
    location: {
      type: DataTypes.STRING(200),
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
    tableName: 'warehouses',
    timestamps: true,
  }
);

export default Warehouse;

