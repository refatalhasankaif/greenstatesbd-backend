import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { globalErrorHandler } from "./app/errors/globalErrorHandler";
import { notFound } from "./app/errors/notFound";
import { env } from "./app/config/env";
import { IndexRoutes } from "./app/routes/index.routes";
import morgan from "morgan";

const app: Application = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
});
app.use(limiter);

app.use(
  cors({
    origin: [env.FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", IndexRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "GreenStatesBD API is running",
  });
});

app.use(notFound);

app.use(globalErrorHandler);

export default app;