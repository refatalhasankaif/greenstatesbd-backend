import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { aiService } from "./ai.service";

const chat = catchAsync(async (req: Request, res: Response) => {
    const result = await aiService.chatAssistant(req.body.message);

    sendResponse(res, {
        success: true,
        message: "AI response",
        data: result,
    }, status.OK);
});

const generateBlog = catchAsync(async (req: Request, res: Response) => {
    const result = await aiService.generateBlog(req.body.topic);

    sendResponse(res, {
        success: true,
        message: "Blog generated",
        data: result,
    }, status.OK);
});

export const aiController = {
    chat,
    generateBlog,
};