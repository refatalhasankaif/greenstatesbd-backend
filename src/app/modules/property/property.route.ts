import { Router } from "express";
import { propertyController } from "./property.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { propertyValidation } from "./property.validation";

const router = Router();

router.post(
  "/",
  checkAuth("USER"),
  validateRequest(propertyValidation.createPropertyValidationSchema),
  propertyController.createProperty
);

router.get("/", propertyController.getAllProperties);

router.get("/:id", propertyController.getPropertyById);

router.patch(
  "/:id",
  checkAuth("USER"),
  validateRequest(propertyValidation.updatePropertyValidationSchema),
  propertyController.updateProperty
);

router.patch(
  "/:id/status",
  checkAuth("ADMIN", "MANAGER"),
  validateRequest(propertyValidation.updateStatusValidationSchema),
  propertyController.updatePropertyStatus
);

router.delete(
  "/:id",
  checkAuth("USER", "ADMIN"),
  propertyController.deleteProperty
);

export const propertyRoutes = router;