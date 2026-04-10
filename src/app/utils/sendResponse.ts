import { Response } from "express";

interface IMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

interface TResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: IMeta;
}

export const sendResponse = <T>(
  res: Response,
  payload: TResponse<T>,
  statusCode = 200
) => {
  return res.status(statusCode).json(payload);
};