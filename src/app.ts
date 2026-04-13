import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import { globalErrorHandler } from "./app/errors/globalErrorHandler";
import { notFound } from "./app/errors/notFound";
import { env } from "./app/config/env";
import { IndexRoutes } from "./app/routes/index.routes";
import morgan from "morgan";

const app: Application = express();

app.use(helmet());

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        env.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000"
      ];
      

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);

app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/uploads", express.static("uploads"));

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