import express from "express";
import cors from "cors";
import pino from "pino-http";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";

import usersRouter from "./routers/usersRouter.js";
import articlesRouter from "./routers/articlesRouter.js";
import { authRouter } from "./routers/auth.js";

const PORT = Number(process.env.PORT) || 3000;

export const startServer = () => {
  const app = express();

  // 🧩 Базові middleware
  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());

  app.use(
    pino({
      transport: {
        target: "pino-pretty",
        options: { colorize: true },
      },
    })
  );

  // 🚏 Маршрути
  app.use("/users", usersRouter);
  app.use("/articles", articlesRouter);
  app.use("/auth", authRouter);

  // 🏠 Кореневий маршрут
  app.get("/", (_req, res) => {
    res.json({ message: "Server is running" });
  });

  // ❌ Обробка помилок
  app.use(notFoundHandler);
  app.use(errorHandler);

  // 🚀 Запуск сервера
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
  });

  return app;
};
