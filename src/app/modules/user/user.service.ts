import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { IUpdateUser } from "./user.interface";
import { Role } from "../../../generated/prisma/enums";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  profileImage: true,
  isBlocked: true,
  isVerified: true,
  verificationStatus: true,
  createdAt: true,
};

const getMyProfile = async (user: any) => {
  return prisma.user.findUnique({
    where: { id: user.id },
    select: userSelect,
  });
};

const getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: userSelect,
  });
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return user;
};

const updateProfile = async (user: any, payload: IUpdateUser) => {
  return prisma.user.update({
    where: { id: user.id },
    data: payload,
    select: userSelect,
  });
};

const updateUserRole = async (id: string, role: Role) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return prisma.user.update({
    where: { id },
    data: { role },
    select: userSelect,
  });
};

const toggleBlockUser = async (id: string, isBlocked: boolean) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return prisma.user.update({
    where: { id },
    data: { isBlocked },
    select: userSelect,
  });
};

export const userService = {
  getMyProfile,
  getAllUsers,
  getUserById,
  updateProfile,
  updateUserRole,
  toggleBlockUser,
};