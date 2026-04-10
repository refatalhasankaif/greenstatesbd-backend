import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { IUpdatePropertyPayload } from "./property.interface";
import {
    PropertyStatus,
    Role,
} from "../../../generated/prisma/enums";

const createProperty = async (payload: any, user: any) => {
    return prisma.property.create({
        data: {
            ...payload,
            basePrice: Number(payload.basePrice),
            ownerId: user.id,
        },
    });
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
            include: { images: true },
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
        include: { images: true, bids: true },
    });

    if (!property) {
        throw new AppError(status.NOT_FOUND, "Property not found");
    }

    return property;
};

import { Division, PropertyType } from "../../../generated/prisma/enums";

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

    // ✅ OWNER or ADMIN
    if (property.ownerId !== user.id && user.role !== Role.ADMIN) {
        throw new AppError(status.FORBIDDEN, "Not allowed");
    }

    // 🔥 SAFE DATA BUILD (NO TYPE ERROR)
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

export const propertyService = {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    updatePropertyStatus,
    deleteProperty,
};