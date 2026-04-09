import { Router } from "express";
import { propertyController } from "./property.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { propertyValidation } from "./property.validation";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  checkAuth(Role.USER),
  validateRequest(propertyValidation.createPropertyValidationSchema),
  propertyController.createProperty
);

router.get("/", propertyController.getAllProperties);

router.get("/:id", propertyController.getPropertyById);

router.patch(
  "/:id",
  checkAuth(Role.USER),
  validateRequest(propertyValidation.updatePropertyValidationSchema),
  propertyController.updateProperty
);

router.patch(
  "/:id/status",
  checkAuth(Role.ADMIN, Role.MANAGER),
  validateRequest(propertyValidation.updateStatusValidationSchema),
  propertyController.updatePropertyStatus
);

router.delete(
  "/:id",
  checkAuth(Role.USER, Role.ADMIN),
  propertyController.deleteProperty
);

export const propertyRoutes = router;