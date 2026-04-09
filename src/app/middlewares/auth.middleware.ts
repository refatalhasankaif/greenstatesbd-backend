
import { Request, Response, NextFunction } from "express";
import { firebaseAdmin } from "../lib/firebase";
import AppError from "../errors/AppError";

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError(401, "Unauthorized");
    }

    const decoded = await firebaseAdmin.auth().verifyIdToken(token);

    (req as any).user = decoded;

    next();
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  } catch (_error) {
    next(new AppError(401, "Invalid or expired token"));
  }
};