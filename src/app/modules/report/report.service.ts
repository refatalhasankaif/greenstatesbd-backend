import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { ReportStatus } from "../../../generated/prisma/enums";

const createReport = async (payload: any, user: any) => {
    const property = await prisma.property.findUnique({
        where: { id: payload.propertyId },
    });

    if (!property) {
        throw new AppError(status.NOT_FOUND, "Property not found");
    }

    return prisma.report.create({
        data: {
            type: payload.type,
            message: payload.message,
            propertyId: payload.propertyId,
            userId: user.id,
        },
    });
};

const getAllReports = async () => {
    return prisma.report.findMany({
        include: {
            user: true,
            property: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const getMyReports = async (user: any) => {
    return prisma.report.findMany({
        where: {
            userId: user.id,
        },
        include: {
            property: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const updateReportStatus = async (
    id: string,
    statusValue: ReportStatus
) => {
    const report = await prisma.report.findUnique({
        where: { id },
    });

    if (!report) {
        throw new AppError(status.NOT_FOUND, "Report not found");
    }

    return prisma.report.update({
        where: { id },
        data: {
            status: statusValue,
        },
    });
};

export const reportService = {
    createReport,
    getAllReports,
    getMyReports,
    updateReportStatus,
};