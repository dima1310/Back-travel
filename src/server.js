import express from "express";
import cors from "cors";
import pino from "pino-http";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";

import usersRouter from "./routers/usersRouter.js";
import storiesRouter from "./routers/storiesRouter.js";
import { authRouter } from "./routers/auth.js";
import categoriesRouter from "./routers/categoriesRouter.js";

import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const PORT = Number(process.env.PORT) || 3000;

// URL фронта в проде (Vercel)
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://front-travellers.vercel.app";

// список разрешённых origin-ов
const allowedOrigins = [FRONTEND_URL];

// в режиме разработки добавляем локальный фронт
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:3000");
}

export const startServer = () => {
  const app = express();

  app.use(express.json());

  app.use(
    cors({
      origin(origin, callback) {
        // запросы без origin (Postman, curl) пропускаем
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // если origin не в списке — режем CORS
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  app.use(cookieParser());

  app.use(
    pino({
      transport: {
        target: "pino-pretty",
        options: { colorize: true },
      },
    })
  );

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const swaggerPath = path.resolve(__dirname, "../docs/openapi.yaml");
  const swaggerDoc = YAML.load(swaggerPath);

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDoc, {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
      customSiteTitle: "Podorozhnyky API Docs",
    })
  );

  app.get("/api-spec", (_req, res) => {
    res.sendFile(swaggerPath);
  });

  app.use("/users", usersRouter);
  app.use("/stories", storiesRouter);
  app.use("/categories", categoriesRouter);
  app.use("/auth", authRouter);

  app.get("/", (_req, res) => {
    res.json({ message: "Server is running" });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`🌐 Allowed origins: ${allowedOrigins.join(", ")}`);
    console.log(`📘 Swagger Docs → http://localhost:${PORT}/api-docs`);
    console.log(`📄 Raw Spec → http://localhost:${PORT}/api-spec`);
  });

  return app;
};
