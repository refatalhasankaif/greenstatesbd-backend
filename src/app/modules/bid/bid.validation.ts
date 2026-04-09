import { z } from "zod";

const createBidValidation = z.object({
  body: z.object({
    propertyId: z.string().uuid(),
    amount: z.number().positive(),
  }),
});

export const bidValidation = {
  createBidValidation,
};