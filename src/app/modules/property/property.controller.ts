import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { propertyService } from "./property.service";
import { PropertyStatus } from "../../../generated/prisma/enums";

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
        data: result.data,
        meta: result.meta,
    });
});

const getMyProperties = catchAsync(async (req: Request, res: Response) => {
    const result = await propertyService.getMyProperties(req.user, req.query);

    sendResponse(res, {
        success: true,
        message: "My properties retrieved successfully",
        data: result.data,
        meta: result.meta,
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
        req.body.status as PropertyStatus,
        req.user
    );

    sendResponse(
        res,
        {
            success: true,
            message: "Property status updated successfully",
            data: result,
        },
        status.OK
    );
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

const uploadImages = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
        return sendResponse(
            res,
            {
                success: false,
                message: "No images provided",
                data: null,
            },
            status.BAD_REQUEST
        );
    }

    const result = await propertyService.uploadImages(id, files, req.user);

    sendResponse(res, {
        success: true,
        message: "Images uploaded successfully",
        data: result,
    });
});

const handoverProperty = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { newOwnerId } = req.body;

    if (!newOwnerId) {
        return sendResponse(
            res,
            {
                success: false,
                message: "New owner ID is required",
                data: null,
            },
            status.BAD_REQUEST
        );
    }

    const result = await propertyService.handoverProperty(id, newOwnerId, req.user);

    sendResponse(res, {
        success: true,
        message: "Property handover successful",
        data: result,
    });
});

const acceptBid = catchAsync(async (req: Request, res: Response) => {
    const propertyId = req.params.id as string;
    const { bidId } = req.body;

    if (!bidId) {
        return sendResponse(
            res,
            {
                success: false,
                message: "Bid ID is required",
                data: null,
            },
            status.BAD_REQUEST
        );
    }

    const result = await propertyService.acceptBid(propertyId, bidId, req.user);

    sendResponse(res, {
        success: true,
        message: "Bid accepted successfully",
        data: result,
    });
});

export const propertyController = {
    createProperty,
    getAllProperties,
    getMyProperties,
    getPropertyById,
    updateProperty,
    updatePropertyStatus,
    deleteProperty,
    uploadImages,
    handoverProperty,
    acceptBid,
};