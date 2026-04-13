import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { IUpdateUser } from "./user.interface";
import { Role } from "../../../generated/prisma/enums";
import { getPagination } from "../../utils/pagination";

const userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    profileImage: true,
    isBlocked: true,
    createdAt: true,
    updatedAt: true,
};

const getMyProfile = async (user: any) => {
    return prisma.user.findUnique({
        where: { id: user.id },
        select: userSelect,
    });
};

const getAllUsers = async (query: any) => {
    const { skip, limit, page } = getPagination(query);

    const [data, total] = await Promise.all([
        prisma.user.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.user.count(),
    ]);

    return {
        meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
        data,
    };
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