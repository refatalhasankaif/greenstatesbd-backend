import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import {
    ReportStatus,
    ReportType,
    Role,
} from "../../../generated/prisma/enums";
import { getPagination } from "../../utils/pagination";
import { IPaginationQuery } from "../../utils/pagination";

type AuthUser = {
    id: string;
    role: Role;
};

type CreateReportPayload = {
    type: ReportType;
    message?: string;
    propertyId?: string;
    blogId?: string;
    galleryId?: string;
};

const createReport = async (
    user: AuthUser,
    payload: CreateReportPayload
) => {
    const { propertyId, blogId, galleryId, type, message } = payload;

    if (!propertyId && !blogId && !galleryId) {
        throw new AppError(status.BAD_REQUEST, "No target provided");
    }

    if (blogId) {
        const blog = await prisma.blog.findUnique({
            where: { id: blogId },
        });

        if (!blog) {
            throw new AppError(status.NOT_FOUND, "Blog not found");
        }

        if (blog.authorId === user.id) {
            throw new AppError(
                status.BAD_REQUEST,
                "You cannot report your own blog"
            );
        }
    }

    if (propertyId) {
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
        });

        if (property && property.ownerId === user.id) {
            throw new AppError(
                status.BAD_REQUEST,
                "You cannot report your own property"
            );
        }
    }

    if (galleryId) {
        const gallery = await prisma.gallery.findUnique({
            where: { id: galleryId },
        });

        if (gallery && gallery.userId === user.id) {
            throw new AppError(
                status.BAD_REQUEST,
                "You cannot report your own gallery"
            );
        }
    }

    return prisma.report.create({
        data: {
            type,
            message,
            userId: user.id,
            propertyId: propertyId || null,
            blogId: blogId || null,
            galleryId: galleryId || null,
        },
    });
};

const getAllReports = async (query: IPaginationQuery) => {
    const { skip, limit, page } = getPagination(query);

    const [data, total] = await Promise.all([
        prisma.report.findMany({
            skip,
            take: limit,
            include: { user: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma.report.count(),
    ]);

    return {
        meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
        data,
    };
};

const getMyReports = async (user: any) => {
    return prisma.report.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });
};

const updateReportStatus = async (
    id: string,
    statusValue: ReportStatus,
    user: any
) => {
    const report = await prisma.report.findUnique({
        where: { id },
    });

    if (!report) {
        throw new AppError(status.NOT_FOUND, "Report not found");
    }

    if (user.role === Role.ADMIN) {
        return prisma.report.update({
            where: { id },
            data: { status: statusValue },
        });
    }

    if (user.role === Role.MANAGER) {
        if (report.propertyId) {
            return prisma.report.update({
                where: { id },
                data: { status: statusValue },
            });
        }
        throw new AppError(status.FORBIDDEN, "Not allowed");
    }

    if (user.role === Role.MODERATOR) {
        if (report.blogId || report.galleryId) {
            return prisma.report.update({
                where: { id },
                data: { status: statusValue },
            });
        }
        throw new AppError(status.FORBIDDEN, "Not allowed");
    }

    throw new AppError(status.FORBIDDEN, "Permission denied");
};

export const reportService = {
    createReport,
    getAllReports,
    getMyReports,
    updateReportStatus,
};