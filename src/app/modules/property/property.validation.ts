import z from "zod";
import { PropertyType, PropertyStatus, Division } from "../../../generated/prisma/client";

export const createPropertyValidationSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    basePrice: z.number().positive(),

    location: z.nativeEnum(Division),
    address: z.string().optional(),

    type: z.nativeEnum(PropertyType),
  }),
});

export const updatePropertyValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    basePrice: z.number().positive().optional(),
    location: z.nativeEnum(Division).optional(),
    address: z.string().optional(),
    type: z.nativeEnum(PropertyType).optional(),
  }),
});

export const updateStatusValidationSchema = z.object({
  body: z.object({
    status: z.nativeEnum(PropertyStatus),
  }),
});

export const handoverPropertyValidationSchema = z.object({
  body: z.object({
    newOwnerId: z.string().min(1, "New owner ID is required"),
  }),
});

export const propertyValidation = {
  createPropertyValidationSchema,
  updatePropertyValidationSchema,
  updateStatusValidationSchema,
  handoverPropertyValidationSchema,
};