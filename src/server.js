import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

import usersRouter from './routers/usersRouter.js';
import storiesRouter from './routers/storiesRouter.js';
import { authRouter } from './routers/auth.js';
import categoriesRouter from './routers/categoriesRouter.js';

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const PORT = Number(process.env.PORT) || 3000;
const ORIGIN = process.env.FRONTEND_URL || 'http://localhost:3000';

export const startServer = () => {
  const app = express();

  // --- MIDDLEWARE ---
  app.use(express.json());
  app.use(
    cors({
      origin: ORIGIN,
      credentials: true,
    }),
  );
  app.use(cookieParser());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    }),
  );

  // --- SWAGGER SETUP ---
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const swaggerPath = path.resolve(__dirname, '../docs/openapi.yaml');
  const swaggerDoc = YAML.load(swaggerPath);

  // UI на /api-docs
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDoc, {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
      customSiteTitle: 'Podorozhnyky API Docs',
    }),
  );

  app.get('/api-spec', (_req, res) => {
    res.sendFile(swaggerPath);
  });

  // --- ROUTES ---
  app.use('/users', usersRouter);
  app.use('/stories', storiesRouter);
  app.use('/categories', categoriesRouter);
  app.use('/auth', authRouter);

  app.get('/', (_req, res) => {
    res.json({ message: 'Server is running' });
  });

  // --- HANDLERS ---
  app.use(notFoundHandler);
  app.use(errorHandler);

  // --- START SERVER ---
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📘 Swagger Docs → http://localhost:${PORT}/api-docs`);
    console.log(`📄 Raw Spec → http://localhost:${PORT}/api-spec`);
  });

  return app;
};
