import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger/swagger';
import authRoutes from './routes/auth.routes';
import clinicRoutes from './routes/clinic.routes';
import warehouseRoutes from './routes/warehouse.routes';
import medicationRoutes from './routes/medication.routes';
import supplyRequestRoutes from './routes/supplyRequest.routes';
import seederRoutes from './routes/seeder.routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'RiwiMediCare Plus API',
  customCss: '.swagger-ui .topbar { display: none }',
}));

app.get('/api-docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/supply-requests', supplyRequestRoutes);
app.use('/api/seeders', seederRoutes);

app.get('/api/health', (_req, res) => {
  res.status(200).json({ message: 'API funcionando correctamente', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
