import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { IUpdatePropertyPayload } from "./property.interface";
import {
    PropertyStatus,
    Role,
    Division,
    PropertyType,
} from "../../../generated/prisma/enums";
import cloudinary from "../../config/cloudinary.config";

const createProperty = async (payload: any, user: any) => {
    const data: any = {
        ...payload,
        basePrice: Number(payload.basePrice),
        ownerId: user.id,
        status: PropertyStatus.ACTIVE,
    };

    return prisma.property.create({ data });
};

const getAllProperties = async (query: any) => {
    const { search, location, type, status, page = 1, limit = 10 } = query;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }

    if (location) where.location = location;
    if (type) where.type = type;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
        prisma.property.findMany({
            where,
            include: { images: true, owner: { select: { id: true, name: true, profileImage: true } } },
            orderBy: { createdAt: "desc" },
            skip,
            take: limitNumber,
        }),
        prisma.property.count({ where }),
    ]);

    return {
        data,
        meta: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPage: Math.ceil(total / limitNumber),
        },
    };
};

const getPropertyById = async (id: string) => {
    const property = await prisma.property.findUnique({
        where: { id },
        include: {
            images: true,
            bids: {
                include: {
                    user: { select: { id: true, name: true, email: true, profileImage: true } }
                }
            },
            owner: { select: { id: true, name: true, profileImage: true } }
        },
    });

    if (!property) {
        throw new AppError(status.NOT_FOUND, "Property not found");
    }

    return property;
};

const getMyProperties = async (user: any, query: any) => {
    const { search, location, type, status, page = 1, limit = 10 } = query;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {
        ownerId: user.id,
    };

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }

    if (location) where.location = location;
    if (type) where.type = type;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
        prisma.property.findMany({
            where,
            include: { images: true, owner: { select: { id: true, name: true, profileImage: true } } },
            orderBy: { createdAt: "desc" },
            skip,
            take: limitNumber,
        }),
        prisma.property.count({ where }),
    ]);

    return {
        data,
        meta: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPage: Math.ceil(total / limitNumber),
        },
    };
};

const updateProperty = async (
    id: string,
    payload: IUpdatePropertyPayload,
    user: any
) => {
    const property = await prisma.property.findUnique({
        where: { id },
    });

    if (!property) {
        throw new AppError(status.NOT_FOUND, "Property not found");
    }


    if (property.ownerId !== user.id && user.role !== Role.ADMIN) {
        throw new AppError(status.FORBIDDEN, "Not allowed");
    }

    const data: any = {};

    if (payload.title !== undefined) data.title = payload.title;
    if (payload.description !== undefined)
        data.description = payload.description;

    if (payload.basePrice !== undefined)
        data.basePrice = Number(payload.basePrice);

    if (payload.location !== undefined)
        data.location = payload.location as Division;

    if (payload.type !== undefined)
        data.type = payload.type as PropertyType;

    if (payload.address !== undefined)
        data.address = payload.address;

    return prisma.property.update({
        where: { id },
        data,
    });
};

const updatePropertyStatus = async (
    id: string,
    statusValue: PropertyStatus,
    user: any
) => {
    const property = await prisma.property.findUnique({
        where: { id },
    });

    if (!property) {
        throw new AppError(status.NOT_FOUND, "Property not found");
    }

    if (user.role === Role.ADMIN) {
        return prisma.property.update({
            where: { id },
            data: { status: statusValue },
        });
    }

    if (user.role === Role.MANAGER) {
        return prisma.property.update({
            where: { id },
            data: { status: statusValue },
        });
    }

    throw new AppError(status.FORBIDDEN, "Not allowed");
};

const deleteProperty = async (id: string, user: any) => {
    const property = await prisma.property.findUnique({
        where: { id },
    });

    if (!property) {
        throw new AppError(status.NOT_FOUND, "Property not found");
    }

    if (property.ownerId !== user.id && user.role !== Role.ADMIN) {
        throw new AppError(status.FORBIDDEN, "Not allowed");
    }

    return prisma.property.delete({
        where: { id },
    });
};

const uploadImages = async (id: string, files: Express.Multer.File[], user: any) => {
    const property = await prisma.property.findUnique({
        where: { id },
    });

    if (!property) {
        throw new AppError(status.NOT_FOUND, "Property not found");
    }


    if (property.ownerId !== user.id && user.role !== Role.ADMIN) {
        throw new AppError(status.FORBIDDEN, "Not allowed");
    }


    const images = await Promise.all(
        files.map(async (file) => {
            try {
                const upload = await cloudinary.uploader.upload(file.path, {
                    folder: `greenstatesbd/properties/${id}`,
                });

                return prisma.propertyImage.create({
                    data: {
                        url: upload.secure_url,
                        propertyId: id,
                    },
                });
            } catch (error) {
                throw new AppError(status.INTERNAL_SERVER_ERROR, `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        })
    );

    return images;
};

const handoverProperty = async (id: string, newOwnerId: string, user: any) => {
    const property = await prisma.property.findUnique({
        where: { id },
    });

    if (!property) {
        throw new AppError(status.NOT_FOUND, "Property not found");
    }

    if (property.ownerId !== user.id && ![Role.ADMIN, Role.MANAGER].includes(user.role)) {
        throw new AppError(status.FORBIDDEN, "Not allowed to handover this property");
    }

    const newOwner = await prisma.user.findUnique({
        where: { id: newOwnerId },
    });

    if (!newOwner) {
        throw new AppError(status.NOT_FOUND, "New owner not found");
    }


    return prisma.property.update({
        where: { id },
        data: { ownerId: newOwnerId },
        include: { owner: { select: { id: true, name: true, email: true } } },
    });
};

const acceptBid = async (propertyId: string, bidId: string, user: any) => {
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
    });

    if (!property) {
        throw new AppError(status.NOT_FOUND, "Property not found");
    }


    if (property.ownerId !== user.id) {
        throw new AppError(status.FORBIDDEN, "Only property owner can accept bids");
    }

    const bid = await prisma.bid.findUnique({
        where: { id: bidId },
    });

    if (!bid) {
        throw new AppError(status.NOT_FOUND, "Bid not found");
    }

    if (bid.propertyId !== propertyId) {
        throw new AppError(status.BAD_REQUEST, "Bid does not belong to this property");
    }


    const updatedProperty = await prisma.property.update({
        where: { id: propertyId },
        data: {
            acceptedBidId: bidId,
        },
        include: {
            images: true,
            bids: true,
            owner: { select: { id: true, name: true, profileImage: true } },
        },
    });

    return updatedProperty;
};

export const propertyService = {
    createProperty,
    getAllProperties,
    getPropertyById,
    getMyProperties,
    updateProperty,
    updatePropertyStatus,
    deleteProperty,
    uploadImages,
    handoverProperty,
    acceptBid,
};
