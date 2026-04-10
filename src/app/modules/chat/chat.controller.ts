import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { chatService } from "./chat.service";

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await chatService.sendMessage(req.user, req.body);

  sendResponse(res, {
    success: true,
    message: "Message sent",
    data: result,
  });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const result = await chatService.getMessages(id);

  sendResponse(res, {
    success: true,
    message: "Messages retrieved",
    data: result,
  });
});

const getMyConversations = catchAsync(async (req: Request, res: Response) => {
  const result = await chatService.getMyConversations(req.user);

  sendResponse(res, {
    success: true,
    message: "Conversations retrieved",
    data: result,
  });
});

export const chatController = {
  sendMessage,
  getMessages,
  getMyConversations,
};