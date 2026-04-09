/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from "express";

type TAsyncFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export const catchAsync =
  (fn: TAsyncFn) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };