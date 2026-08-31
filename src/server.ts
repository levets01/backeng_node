import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import sequelize from './config/database';
import './models';

const PORT = parseInt(process.env.PORT || '3000', 10);

/**

* Starts the server and synchronizes the database.

*/

const startServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL established successfully');

    await sequelize.sync({ alter: true });
    console.log('Models synchronized with the database');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger documentation in http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', (error as Error).message);
    process.exit(1);
  }
};

startServer();
