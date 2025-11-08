import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import usersRouter from './routers/usersRouter.js';
import articlesRouter from './routers/articlesRouter.js';
import cookieParser from 'cookie-parser';
import { authRouter } from './routers/auth.js';

const PORT = Number(process.env.PORT) || 3000;

export const startServer = () => {
  const app = express();

  app.use(express.json());

  app.use(cors());
  app.use(cookieParser());
  app.use(
    pino({
      transport: { target: 'pino-pretty' },
    }),
  );

  // маршрути
  app.use('/users', usersRouter);
  app.use('/articles', articlesRouter);
  app.use('/auth', authRouter);

  app.get('/', (_req, res) => {
    res.json({ message: 'Server is running' });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);

  });

  return app;
};
