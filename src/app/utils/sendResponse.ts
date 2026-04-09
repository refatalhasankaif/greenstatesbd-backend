import { Response } from "express";

interface TMeta {
  page?: number;
  limit?: number;
  total?: number;
}

interface TResponse<T> {
  success: boolean;
  message?: string;
  meta?: TMeta;
  data?: T;
}

export const sendResponse = <T>(
  res: Response,
  {
    success,
    message,
    meta,
    data,
  }: TResponse<T>,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success,
    message,
    meta,
    data,
  });
};