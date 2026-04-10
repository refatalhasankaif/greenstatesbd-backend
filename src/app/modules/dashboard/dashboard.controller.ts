import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { dashboardService } from "./dashboard.service";

const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const result = await dashboardService.getDashboard(
    req.user,
    req.query
  );

  sendResponse(res, {
    success: true,
    message: "Dashboard data retrieved",
    data: result,
  });
});

export const dashboardController = {
  getDashboard,
};