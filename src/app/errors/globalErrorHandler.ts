/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  logger.error(err.message || "Server Error", err);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { error: err }),
  });
};