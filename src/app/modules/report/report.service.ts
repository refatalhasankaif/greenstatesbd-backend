import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import {
    ReportStatus,
    Role,
} from "../../../generated/prisma/enums";
import { getPagination } from "../../utils/pagination";

type CreateReportPayload = {
    type: any;
    message?: string;
    propertyId?: string;
    blogId?: string;
    galleryId?: string;
};

const createReport = async (user: any, payload: CreateReportPayload) => {
    const { propertyId, blogId, galleryId, type, message } = payload;

    if (!propertyId && !blogId && !galleryId) {
        throw new AppError(status.BAD_REQUEST, "No target provided");
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

const getAllReports = async (query: any) => {
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