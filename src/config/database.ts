
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

/**
 * PostgreSQL database host.
 *
 * @default "localhost"
 */
const DB_HOST: string = process.env.DB_HOST || 'localhost';

/**
 * PostgreSQL database port.
 *
 * @default 5432
 */
const DB_PORT: number = parseInt(process.env.DB_PORT || '5432', 10);

/**
 * PostgreSQL database name.
 *
 * @default "rimimedicare_db"
 */
const DB_NAME: string = process.env.DB_NAME || 'rimimedicare_db';

/**
 * PostgreSQL database username.
 *
 * @default "postgres"
 */
const DB_USER: string = process.env.DB_USER || 'postgres';

/**
 * PostgreSQL database password.
 *
 * @default "postgres"
 */
const DB_PASSWORD: string = process.env.DB_PASSWORD || 'postgres';

/**
 * Sequelize instance used to manage the PostgreSQL database connection.
 *
 * The connection settings are loaded from environment variables,
 * with default values provided for local development.
 *
 * @type {Sequelize}
 */
const sequelize: Sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',

  /**
   * Disables SQL query logging.
   */
  logging: false,

  /**
   * Configures the database connection pool.
   *
   * @property {number} max - Maximum number of connections in the pool.
   * @property {number} min - Minimum number of connections in the pool.
   * @property {number} acquire - Maximum time in milliseconds to acquire a connection.
   * @property {number} idle - Maximum time in milliseconds a connection can remain idle.
   */
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
