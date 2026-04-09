import { Response } from "express";

interface TResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const sendResponse = <T>(
  res: Response,
  payload: TResponse<T>,
  statusCode = 200
) => {
  return res.status(statusCode).json(payload);
};