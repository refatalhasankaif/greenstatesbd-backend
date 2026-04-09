import { z } from "zod";
import { Role } from "../../../generated/prisma/enums";

const updateProfileValidation = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    profileImage: z.string().url().optional(),
  }),
});

const updateUserRoleValidation = z.object({
  body: z.object({
    role: z.nativeEnum(Role),
  }),
});

const blockUserValidation = z.object({
  body: z.object({
    isBlocked: z.boolean(),
  }),
});

export const userValidation = {
  updateProfileValidation,
  updateUserRoleValidation,
  blockUserValidation,
};