import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { propertyService } from "./property.service";

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.createProperty(req.body, req.user);

  sendResponse(res, {
    success: true,
    message: "Property created successfully",
    data: result,
  }, status.CREATED);
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.getAllProperties(req.query);

  sendResponse(res, {
    success: true,
    message: "Properties retrieved successfully",
    data: result,
  });
});

const getPropertyById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await propertyService.getPropertyById(id);

  sendResponse(res, {
    success: true,
    message: "Property retrieved successfully",
    data: result,
  });
});

const updateProperty = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await propertyService.updateProperty(
    id,
    req.body,
    req.user
  );

  sendResponse(res, {
    success: true,
    message: "Property updated successfully",
    data: result,
  });
});

const updatePropertyStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await propertyService.updatePropertyStatus(
    id,
    req.body.status,
    req.user
  );

  sendResponse(res, {
    success: true,
    message: "Property status updated successfully",
    data: result,
  });
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await propertyService.deleteProperty(id, req.user);

  sendResponse(res, {
    success: true,
    message: "Property deleted successfully",
    data: result,
  });
});

export const propertyController = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  updatePropertyStatus,
  deleteProperty,
};