import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { reportService } from "./report.service";

const createReport = catchAsync(async (req: Request, res: Response) => {
    const result = await reportService.createReport(
        req.body,
        req.user
    );

    sendResponse(res, {
        success: true,
        message: "Report submitted successfully",
        data: result,
    }, status.CREATED);
});

const getAllReports = catchAsync(async (_req: Request, res: Response) => {
    const result = await reportService.getAllReports();

    sendResponse(res, {
        success: true,
        message: "Reports retrieved successfully",
        data: result,
    });
});

const getMyReports = catchAsync(async (req: Request, res: Response) => {
    const result = await reportService.getMyReports(req.user);

    sendResponse(res, {
        success: true,
        message: "My reports retrieved",
        data: result,
    });
});

const updateReportStatus = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const result = await reportService.updateReportStatus(
        id,
        req.body.status
    );

    sendResponse(
        res,
        {
            success: true,
            message: "Report status updated",
            data: result,
        }
    );
});

export const reportController = {
    createReport,
    getAllReports,
    getMyReports,
    updateReportStatus,
};