import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { authService } from "./auth.service";
import { firebaseAdmin } from "../../lib/firebase";

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
  const { idToken, name, profileImage } = req.body;
  const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);

  const result = await authService.socialAuth({
    firebaseUid: decoded.uid,
    email: decoded.email!,
    name: name || decoded.name || "User",
    profileImage: profileImage || decoded.picture,
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