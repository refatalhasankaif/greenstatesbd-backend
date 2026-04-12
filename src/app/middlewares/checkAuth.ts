import { Request, Response, NextFunction } from "express";
import { firebaseAdmin } from "../lib/firebase";
import AppError from "../errors/AppError";
import status from "http-status";
import { prisma } from "../lib/prisma";
import { Role } from "../../generated/prisma/enums";

export const checkAuth =
  (...roles: Role[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const headerToken = req.headers.authorization?.split(" ")[1];
      const cookieToken = req.cookies?.auth_token;
      const token = headerToken || cookieToken;

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
      
      if (roles.length && !roles.includes(user.role)) {
        throw new AppError(status.FORBIDDEN, "Forbidden");
      }

      req.user = user;

      next();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    } catch (error) {
      next(new AppError(status.UNAUTHORIZED, "Invalid or expired token"));
    }
  };