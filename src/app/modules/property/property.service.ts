import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import status from "http-status";
import { IUpdatePropertyPayload } from "./property.interface";

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
  const { search, location, type, status } = query;

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

  return prisma.property.findMany({
    where,
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });
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

  if (property.ownerId !== user.id) {
    throw new AppError(status.FORBIDDEN, "Only owner can update");
  }

  return prisma.property.update({
    where: { id },
    data: payload as any,
  });
};


const updatePropertyStatus = async (
  id: string,
  statusValue: string,
  user: any
) => {
  if (!["ADMIN", "MANAGER"].includes(user.role)) {
    throw new AppError(status.FORBIDDEN, "Not allowed");
  }

  return prisma.property.update({
    where: { id },
    data: { status: statusValue as any },
  });
};


const deleteProperty = async (id: string, user: any) => {
  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property) {
    throw new AppError(status.NOT_FOUND, "Property not found");
  }

  if (property.ownerId !== user.id && user.role !== "ADMIN") {
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