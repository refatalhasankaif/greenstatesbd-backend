import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { userService } from "./user.service";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getMyProfile(req.user);

  sendResponse(res, {
    success: true,
    message: "Profile retrieved",
    data: result,
  }, status.OK);
});

const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const result = await userService.getAllUsers();

  sendResponse(res, {
    success: true,
    message: "Users retrieved",
    data: result,
  }, status.OK);
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await userService.getUserById(id);

  sendResponse(res, {
    success: true,
    message: "User retrieved",
    data: result,
  }, status.OK);
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.updateProfile(req.user, req.body);

  sendResponse(res, {
    success: true,
    message: "Profile updated",
    data: result,
  }, status.OK);
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await userService.updateUserRole(id, req.body.role);

  sendResponse(res, {
    success: true,
    message: "User role updated",
    data: result,
  }, status.OK);
});

const toggleBlockUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await userService.toggleBlockUser(
    id,
    req.body.isBlocked
  );

  sendResponse(res, {
    success: true,
    message: "User status updated",
    data: result,
  }, status.OK);
});

export const userController = {
  getMyProfile,
  getAllUsers,
  getUserById,
  updateProfile,
  updateUserRole,
  toggleBlockUser,
};