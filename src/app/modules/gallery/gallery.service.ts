import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import cloudinary from "../../config/cloudinary.config";
import { getPagination, IPaginationQuery } from "../../utils/pagination";

const createGallery = async (file: any, payload: any, user: any) => {
    if (!file) throw new AppError(status.BAD_REQUEST, "Image is required");

    const upload = await cloudinary.uploader.upload(file.path, {
        folder: "gallery",
    });

    return prisma.gallery.create({
        data: {
            title: payload.title,
            imageUrl: upload.secure_url,
            publicId: upload.public_id,
            userId: user.id,
        },
        include: {
            user: { select: { name: true, profileImage: true } },
        },
    });
};

const getAllGallery = async (query: any) => {
    const { skip, limit, page } = getPagination(query);

    const [data, total] = await Promise.all([
        prisma.gallery.findMany({
            where: { isBlocked: false },
            include: {
                user: { select: { name: true, profileImage: true } },
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.gallery.count({ where: { isBlocked: false } }),
    ]);

    return {
        meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
        data,
    };
};

const getMyGallery = async (user: any, query: IPaginationQuery) => {
    const { skip, limit, page } = getPagination(query);

    const [data, total] = await Promise.all([
        prisma.gallery.findMany({
            where: { userId: user.id },
            include: { user: true },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.gallery.count({ where: { userId: user.id } }),
    ]);

    return {
        data,
        meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    };
};

const deleteGallery = async (id: string, user: any) => {
    const gallery = await prisma.gallery.findUnique({ where: { id } });
    if (!gallery) throw new AppError(status.NOT_FOUND, "Gallery not found");
    if (gallery.userId !== user.id && user.role !== Role.ADMIN) {
        throw new AppError(status.FORBIDDEN, "Not allowed");
    }
    await cloudinary.uploader.destroy(gallery.publicId);
    return prisma.gallery.delete({ where: { id } });
};

const toggleBlockGallery = async (id: string, user: any) => {
    if (![Role.ADMIN, Role.MODERATOR].includes(user.role)) {
        throw new AppError(status.FORBIDDEN, "Not allowed");
    }
    const gallery = await prisma.gallery.findUnique({ where: { id } });
    if (!gallery) throw new AppError(status.NOT_FOUND, "Gallery not found");
    return prisma.gallery.update({
        where: { id },
        data: { isBlocked: !gallery.isBlocked },
    });
};

const likeGallery = async (id: string, user: any) => {
    const gallery = await prisma.gallery.findUnique({ where: { id } });
    if (!gallery) throw new AppError(status.NOT_FOUND, "Gallery not found");

    const existingLike = await prisma.galleryLike.findUnique({
        where: {
            userId_galleryId: {
                userId: user.id,
                galleryId: id,
            },
        },
    });

    if (existingLike) {
        await prisma.galleryLike.delete({
            where: {
                userId_galleryId: {
                    userId: user.id,
                    galleryId: id,
                },
            },
        });

        const updated = await prisma.gallery.update({
            where: { id },
            data: { likesCount: { decrement: 1 } },
        });

        return { likesCount: updated.likesCount, liked: false };
    } else {
        await prisma.galleryLike.create({
            data: { userId: user.id, galleryId: id },
        });

        const updated = await prisma.gallery.update({
            where: { id },
            data: { likesCount: { increment: 1 } },
        });

        return { likesCount: updated.likesCount, liked: true };
    }
};

const getLikedIds = async (user: any): Promise<string[]> => {
    const likes = await prisma.galleryLike.findMany({
        where: { userId: user.id },
        select: { galleryId: true },
    });
    return likes.map((l) => l.galleryId);
};

export const galleryService = {
    createGallery,
    getAllGallery,
    getMyGallery,
    deleteGallery,
    toggleBlockGallery,
    likeGallery,
    getLikedIds,
};