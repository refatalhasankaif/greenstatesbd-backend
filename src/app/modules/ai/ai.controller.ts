import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { generateAIResponse } from "./ai.service";

const chatWithAI = catchAsync(async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message) {
    return sendResponse(res, {
      success: false,
      message: "Message is required",
    }, status.BAD_REQUEST);
  }

  const result = await generateAIResponse(message);

  sendResponse(res, {
    success: true,
    message: "AI response generated successfully",
    data: result,
  });
});

export const aiController = {
  chatWithAI,
};