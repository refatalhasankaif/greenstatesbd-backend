import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import {
  ReportStatus,
  Role,
} from "../../../generated/prisma/enums";

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

const getAllReports = async (user: any) => {
  if (user.role === Role.ADMIN) {
    return prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
  }

  if (user.role === Role.MANAGER) {
    return prisma.report.findMany({
      where: { propertyId: { not: null } },
      orderBy: { createdAt: "desc" },
    });
  }

  if (user.role === Role.MODERATOR) {
    return prisma.report.findMany({
      where: {
        OR: [
          { blogId: { not: null } },
          { galleryId: { not: null } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  throw new AppError(status.FORBIDDEN, "Not allowed");
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