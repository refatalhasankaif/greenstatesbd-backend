import { Request, Response } from "express";
import { createProperty } from "./property.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

export const createPropertyController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await createProperty(req);

    sendResponse(res, {
      success: true,
      message: "Property created successfully",
      data: result,
    });
  }
);