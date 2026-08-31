import swaggerJsdoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';
import path from 'path';

const routesDir = path.resolve(__dirname, '../routes');

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RiwiMediCare Plus - API de Abastecimiento',
      version: '1.0.0',
      description: 'API REST para gestionar solicitudes de abastecimiento de medicamentos e insumos médicos',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Ingrese el token JWT con el formato: Bearer <token>',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [`${routesDir}/*.ts`, `${routesDir}/*.js`],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
