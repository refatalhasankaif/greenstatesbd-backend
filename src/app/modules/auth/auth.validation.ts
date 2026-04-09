import { z } from "zod";

const checkEmailValidation = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const registerValidation = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
    profileImage: z.string().url().optional(),
  }),
});

const loginValidation = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const socialAuthValidation = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string(),
    profileImage: z.string().url().optional(),
  }),
});

export const authValidation = {
  checkEmailValidation,
  registerValidation,
  loginValidation,
  socialAuthValidation,
};