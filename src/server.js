import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import usersRouter from './routes/usersRouter.js';
import articlesRouter from './routes/articlesRouter.js';

const PORT = Number(process.env.PORT) || 3000;

export const startServer = () => {
  const app = express();
  app.use(express.json());
  app.use(cors());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  // маршрути
  app.use('/api/users', usersRouter);
  app.use('/api/articles', articlesRouter);


  app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });

  return app;
};
