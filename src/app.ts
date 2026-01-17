import path from 'path';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import healthRoutes from './routes/healthRoutes';
import itemRoutes from './routes/itemRoutes';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import { resetStore } from './models/store';

const app: Application = express();
app.use(cors());
app.use(express.json());

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
 *     Item:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Sample item
 *         price:
 *           type: number
 *           format: float
 *           example: 9.99
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 64b0c0f2f2f0f2f0f2f0f2f0
 *         sender_id:
 *           type: integer
 *           example: 1
 *         content:
 *           type: string
 *           example: Short bio
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
 *         sender_id:
 *           type: integer
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
 *         sender_id:
 *           type: integer
 *         post_id:
 *           type: string
 */

app.use('/api', healthRoutes);
app.use('/api', itemRoutes);
app.use('/api', userRoutes);
app.use('/api', postRoutes);
app.use('/api', commentRoutes);

// Fallback handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

export { app, resetStore };
