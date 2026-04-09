import { Request, Response, NextFunction } from "express";
import { firebaseAdmin } from "../lib/firebase";
import AppError from "../errors/AppError";
import status from "http-status";
import { prisma } from "../lib/prisma";

export const checkAuth =
  (...roles: string[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized");
      }

      const decoded = await firebaseAdmin.auth().verifyIdToken(token);

      const user = await prisma.user.findUnique({
        where: { firebaseUid: decoded.uid },
      });

      if (!user) {
        throw new AppError(status.UNAUTHORIZED, "User not found");
      }

      if (user.isBlocked) {
        throw new AppError(status.FORBIDDEN, "User is blocked");
      }

      // ROLE CHECK
      if (roles.length && !roles.includes(user.role)) {
        throw new AppError(status.FORBIDDEN, "Forbidden");
      }

      (req as any).user = user;

      next();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    } catch (_error) {
      next(new AppError(status.UNAUTHORIZED, "Invalid or expired token"));
    }
  };