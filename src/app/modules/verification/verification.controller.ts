import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { verificationService } from "./verification.service";

const createRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await verificationService.createRequest(
    req.body,
    req.user
  );

  sendResponse(
    res,
    {
      success: true,
      message: "Verification request submitted",
      data: result,
    },
    status.CREATED
  );
});

const getMyRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await verificationService.getMyRequest(req.user);

  sendResponse(res, {
    success: true,
    message: "My verification request",
    data: result,
  });
});

const getAllRequests = catchAsync(async (_req: Request, res: Response) => {
  const result = await verificationService.getAllRequests();

  sendResponse(res, {
    success: true,
    message: "All verification requests",
    data: result,
  });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const result = await verificationService.updateStatus(
    id,
    req.body.status,
    req.user
  );

  sendResponse(res, {
    success: true,
    message: "Verification status updated",
    data: result,
  });
});

export const verificationController = {
  createRequest,
  getMyRequest,
  getAllRequests,
  updateStatus,
};