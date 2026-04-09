import z from "zod";
import { PropertyType, PropertyStatus, Division } from "../../../generated/prisma/client";

export const createPropertyValidationSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    basePrice: z.number(),

    location: z.nativeEnum(Division),
    address: z.string().optional(),

    type: z.nativeEnum(PropertyType),

    biddingStart: z.string().optional(),
    biddingEnd: z.string().optional(),
  }),
});

export const updatePropertyValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    basePrice: z.number().optional(),
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

export const propertyValidation = {
  createPropertyValidationSchema,
  updatePropertyValidationSchema,
  updateStatusValidationSchema,
};