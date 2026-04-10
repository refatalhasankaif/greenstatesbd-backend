import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import {
  VerificationStatus,
  Role,
} from "../../../generated/prisma/enums";
import { ICreateVerificationRequest } from "./verification.interface";

const createRequest = async (
  payload: ICreateVerificationRequest,
  user: any
) => {
  const existing = await prisma.verificationRequest.findUnique({
    where: { userId: user.id },
  });

  if (existing) {
    throw new AppError(
      status.BAD_REQUEST,
      "Verification request already submitted"
    );
  }

  return prisma.verificationRequest.create({
    data: {
      documentUrl: payload.documentUrl,
      note: payload.note,
      userId: user.id,
    },
  });
};

const getMyRequest = async (user: any) => {
  return prisma.verificationRequest.findUnique({
    where: { userId: user.id },
  });
};

const getAllRequests = async () => {
  return prisma.verificationRequest.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          verificationStatus: true,
          isVerified: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateStatus = async (
  id: string,
  statusValue: VerificationStatus,
  user: any
) => {
  const request = await prisma.verificationRequest.findUnique({
    where: { id },
  });

  if (!request) {
    throw new AppError(status.NOT_FOUND, "Verification request not found");
  }

  if (
    ![Role.ADMIN, Role.MANAGER, Role.MODERATOR].includes(user.role)
  ) {
    throw new AppError(status.FORBIDDEN, "Not allowed");
  }

  const updatedRequest = await prisma.verificationRequest.update({
    where: { id },
    data: {
      status: statusValue,
    },
  });

  if (statusValue === VerificationStatus.APPROVED) {
    await prisma.user.update({
      where: { id: request.userId },
      data: {
        isVerified: true,
        verificationStatus: VerificationStatus.APPROVED,
      },
    });
  }

  if (statusValue === VerificationStatus.REJECTED) {
    await prisma.user.update({
      where: { id: request.userId },
      data: {
        isVerified: false,
        verificationStatus: VerificationStatus.REJECTED,
      },
    });
  }

  return updatedRequest;
};

export const verificationService = {
  createRequest,
  getMyRequest,
  getAllRequests,
  updateStatus,
};