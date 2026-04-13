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
            include: {
                user: { select: { id: true, name: true, email: true } },
                property: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        location: true,
                        basePrice: true,
                        status: true,
                        images: { select: { url: true }, take: 1 }
                    }
                },
                blog: {
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        author: { select: { id: true, name: true, email: true } }
                    }
                },
                gallery: {
                    select: {
                        id: true,
                        title: true,
                        imageUrl: true,
                        user: { select: { id: true, name: true, email: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.report.count(),
    ]);

    return {
        meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
        data,
    };
};

const getMyReports = async (user: any, query: IPaginationQuery) => {
    const { skip, limit, page } = getPagination(query);

    const [data, total] = await Promise.all([
        prisma.report.findMany({
            where: { userId: user.id },
            include: {
                property: true,
                blog: true,
                gallery: true,
                user: true,
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.report.count({ where: { userId: user.id } }),
    ]);

    return {
        data,
        meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    };
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

    if (user.role === Role.MODERATOR) {
        return prisma.report.update({
            where: { id },
            data: { status: statusValue },
        });
    }

    throw new AppError(status.FORBIDDEN, "Not authorized to update report status");
};

const takeActionOnReport = async (
    reportId: string,
    action: "BLOCK" | "ALLOW",
    user: any
) => {

    if (user.role !== Role.ADMIN && user.role !== Role.MODERATOR) {
        throw new AppError(status.FORBIDDEN, "Not authorized to take action");
    }

    const report = await prisma.report.findUnique({
        where: { id: reportId },
    });

    if (!report) {
        throw new AppError(status.NOT_FOUND, "Report not found");
    }

    const shouldBlock = action === "BLOCK";

    if (report.propertyId) {

        if (shouldBlock) {
            await prisma.property.update({
                where: { id: report.propertyId },
                data: { status: "CLOSED" },
            });
        }
    } else if (report.blogId) {

        await prisma.blog.update({
            where: { id: report.blogId },
            data: { isBlocked: shouldBlock },
        });
    } else if (report.galleryId) {

        await prisma.gallery.update({
            where: { id: report.galleryId },
            data: { isBlocked: shouldBlock },
        });
    }


    const updatedReport = await prisma.report.update({
        where: { id: reportId },
        data: {
            status: "RESOLVED",
        },
        include: {
            user: { select: { id: true, name: true, email: true } },
            property: true,
            blog: true,
            gallery: true,
        },
    });

    return updatedReport;
};

export const reportService = {
    createReport,
    getAllReports,
    getMyReports,
    updateReportStatus,
    takeActionOnReport,
};