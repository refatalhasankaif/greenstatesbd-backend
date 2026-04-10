import { z } from "zod";

const createBlogValidation = z.object({
  body: z.object({
    title: z.string().min(3).max(100),
    content: z.string().min(20),
  }),
});

const updateBlogValidation = z.object({
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    content: z.string().min(20).optional(),
  }),
});

const toggleBlockValidation = z.object({
  body: z.object({
    isBlocked: z.boolean(),
  }),
});

export const blogValidation = {
  createBlogValidation,
  updateBlogValidation,
  toggleBlockValidation,
};