import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { authService } from "./auth.service";

const checkEmail = catchAsync(async (req: Request, res: Response) => {
  await authService.checkEmail(req.body.email);

  sendResponse(
    res,
    {
      success: true,
      message: "Email exists",
      data: null,
    },
    status.OK
  );
});

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);

  sendResponse(
    res,
    {
      success: true,
      message: "User registered successfully",
      data: result,
    },
    status.CREATED
  );
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);

  sendResponse(
    res,
    {
      success: true,
      message: "Login successful",
      data: result,
    },
    status.OK
  );
});

const social = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.socialAuth({
    firebaseUid: req.user!.firebaseUid,
    email: req.body.email,
    name: req.body.name,
    profileImage: req.body.profileImage,
  });

  sendResponse(
    res,
    {
      success: true,
      message: "Social login successful",
      data: result,
    },
    status.OK
  );
});

export const authController = {
  checkEmail,
  register,
  login,
  social,
};