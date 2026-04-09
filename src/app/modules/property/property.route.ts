import { Router } from "express";
import { createPropertyController } from "./property.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer.config";
import { validateRequest } from "../../middlewares/validateRequest";
import { createPropertySchema } from "./property.validation";

const router = Router();

router.post(
  "/",
  authMiddleware,
  upload.array("images", 5),
  validateRequest(createPropertySchema),
  createPropertyController
);

export const PropertyRoutes = router;