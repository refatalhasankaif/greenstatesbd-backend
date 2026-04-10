import { Router } from "express";
import { blogController } from "./blog.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { blogValidation } from "./blog.validation";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  checkAuth(),
  validateRequest(blogValidation.createBlogValidation),
  blogController.createBlog
);

router.get(
  "/me",
  checkAuth(),
  blogController.getMyBlogs
);

router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlogById);

router.patch(
  "/:id",
  checkAuth(),
  validateRequest(blogValidation.updateBlogValidation),
  blogController.updateBlog
);

router.delete(
  "/:id",
  checkAuth(),
  blogController.deleteBlog
);

router.patch(
  "/:id/block",
  checkAuth(Role.ADMIN, Role.MODERATOR),
  validateRequest(blogValidation.toggleBlockValidation),
  blogController.toggleBlockBlog
);

export const blogRoutes = router;