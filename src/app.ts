import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


import { globalErrorHandler } from "./app/errors/globalErrorHandler";
import { notFound } from "./app/errors/notFound";
import { env } from "./app/config/env";
import { IndexRoutes } from "./app/routes/index.routes";

const app: Application = express();

app.use(
  cors({
    origin: [env.FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", IndexRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "GreenStatesBD API is running",
  });
});

app.use(notFound);

app.use(globalErrorHandler);

export default app;