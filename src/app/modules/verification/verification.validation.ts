import z from "zod";
import { VerificationStatus } from "../../../generated/prisma/enums";

const createVerificationRequestValidation = z.object({
  body: z.object({
    documentUrl: z.string().url(),
    note: z.string().optional(),
  }),
});

const updateVerificationStatusValidation = z.object({
  body: z.object({
    status: z.nativeEnum(VerificationStatus),
  }),
});

export const verificationValidation = {
  createVerificationRequestValidation,
  updateVerificationStatusValidation,
};