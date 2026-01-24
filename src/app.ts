import path from 'path';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import healthRoutes from './routes/healthRoutes';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import { resetStore } from './models/store';

const app: Application = express();
app.use(cors());
app.use(express.json());

// Log request time, duration, and status for each request
app.use((req: Request, res: Response, next) => {
  const startedAt = new Date();
  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;
    const timestamp = startedAt.toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(2)}ms`);
  });

  next();
});

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Sample REST API',
    version: '2.0.0',
    description: 'Express REST API with Swagger docs and Jest tests'
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local dev server' }]
};

const swaggerOptions = {
  swaggerDefinition,
  apis: [
    path.join(__dirname, 'routes', '*.ts'),
    __filename
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 64b0c0f2f2f0f2f0f2f0f2f0
 *         username:
 *           type: string
 *           example: johndoe
 *         date:
 *           type: string
 *           format: date-time
 *         email:
 *           type: string
 *           format: email
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         content:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         owner:
 *           type: string
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         content:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         owner:
 *           type: string
 *         post_id:
 *           type: string
 */

app.use('/api', healthRoutes);
app.use('/api', userRoutes);
app.use('/api', postRoutes);
app.use('/api', commentRoutes);

// Fallback handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

export { app, resetStore };
