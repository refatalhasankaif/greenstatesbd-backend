import { z } from "zod";
import { PropertyType } from "../../../generated/prisma/client";

export const createPropertySchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(10),

    basePrice: z.number().positive(),

    location: z.string(),
    address: z.string().optional(),

    type: z.nativeEnum(PropertyType),

    biddingStart: z.string().optional(),
    biddingEnd: z.string().optional(),
  }),
});