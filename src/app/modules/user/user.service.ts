import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { IUpdateUser } from "./user.interface";
import { Role } from "../../../generated/prisma/enums";

const getMyProfile = async (user: any) => {
  return prisma.user.findUnique({
    where: { id: user.id },
  });
};

const getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
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