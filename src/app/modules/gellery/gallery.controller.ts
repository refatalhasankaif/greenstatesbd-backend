import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { galleryService } from "./gallery.service";

const createGallery = catchAsync(async (req: Request, res: Response) => {
    const result = await galleryService.createGallery(
        req.file,
        req.body,
        req.user
    );

    sendResponse(
        res,
        {
            success: true,
            message: "Gallery created successfully",
            data: result,
        },
        status.CREATED
    );
});

const getAllGallery = catchAsync(async (req: Request, res: Response) => {
  const result = await galleryService.getAllGallery(req.query);

  sendResponse(res, {
    success: true,
    message: "Gallery retrieved",
    data: result.data,
    meta: result.meta,
  });
});

const getMyGallery = catchAsync(async (req: Request, res: Response) => {
    const result = await galleryService.getMyGallery(req.user);

    sendResponse(res, {
        success: true,
        message: "My gallery retrieved",
        data: result,
    });
});

const deleteGallery = catchAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

    const result = await galleryService.deleteGallery(id, req.user);

    sendResponse(res, {
        success: true,
        message: "Gallery deleted successfully",
        data: result,
    });
});

const toggleBlockGallery = catchAsync(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const result = await galleryService.toggleBlockGallery(id, req.user);

  sendResponse(res, {
    success: true,
    message: "Gallery status updated",
    data: result,
  });
});

export const galleryController = {
    createGallery,
    getAllGallery,
    getMyGallery,
    deleteGallery,
    toggleBlockGallery,
};