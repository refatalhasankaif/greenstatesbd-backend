import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { supportService } from "./support.service";

const requestSupport = catchAsync(async (req: Request, res: Response) => {
  const result = await supportService.requestSupport(req.user);

  sendResponse(res, {
    success: true,
    message: "Connecting to support agent...",
    data: result,
  }, status.CREATED);
});

const acceptSession = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const result = await supportService.acceptSession(id, req.user);

  sendResponse(res, {
    success: true,
    message: "Call accepted",
    data: result,
  });
});

const rejectSession = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const result = await supportService.rejectSession(id, req.user);

  sendResponse(res, {
    success: true,
    message: "Call rejected",
    data: result,
  });
});

const endSession = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const result = await supportService.endSession(id);

  sendResponse(res, {
    success: true,
    message: "Call ended",
    data: result,
  });
});

export const supportController = {
  requestSupport,
  acceptSession,
  rejectSession,
  endSession,
};