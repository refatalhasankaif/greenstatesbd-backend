import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { reportService } from "./report.service";
import { ReportStatus } from "../../../generated/prisma/enums";

const createReport = catchAsync(async (req: Request, res: Response) => {
  const result = await reportService.createReport(
    req.user as any,
    req.body
  );

  sendResponse(
    res,
    {
      success: true,
      message: "Report submitted successfully",
      data: result,
    },
    status.CREATED
  );
});

const getAllReports = catchAsync(async (req: Request, res: Response) => {
  const result = await reportService.getAllReports(req.user as any);

  sendResponse(
    res,
    {
      success: true,
      message: "Reports retrieved successfully",
      data: result,
    },
    status.OK
  );
});

const getMyReports = catchAsync(async (req: Request, res: Response) => {
  const result = await reportService.getMyReports(req.user as any);

  sendResponse(
    res,
    {
      success: true,
      message: "My reports retrieved",
      data: result,
    },
    status.OK
  );
});

const updateReportStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const statusValue = req.body.status as ReportStatus;

  const result = await reportService.updateReportStatus(
    id,
    statusValue,
    req.user as any
  );

  sendResponse(
    res,
    {
      success: true,
      message: "Report status updated",
      data: result,
    },
    status.OK
  );
});

export const reportController = {
  createReport,
  getAllReports,
  getMyReports,
  updateReportStatus,
};