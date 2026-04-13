import { Router } from "express";
import { propertyController } from "./property.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { propertyValidation } from "./property.validation";
import { Role } from "../../../generated/prisma/enums";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = Router();

router.post(
    "/",
    checkAuth(Role.USER),
    validateRequest(propertyValidation.createPropertyValidationSchema),
    propertyController.createProperty
);

router.get("/me", checkAuth(Role.USER), propertyController.getMyProperties);
router.get("/", propertyController.getAllProperties);
router.get("/:id", propertyController.getPropertyById);

router.patch(
    "/:id",
    checkAuth(Role.USER, Role.ADMIN),
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

router.post(
    "/:id/images",
    checkAuth(Role.USER, Role.ADMIN),
    upload.array("images", 10),
    propertyController.uploadImages
);

router.patch(
    "/:id/handover",
    checkAuth(Role.MANAGER, Role.ADMIN),
    propertyController.handoverProperty
);

router.post(
    "/:id/accept-bid",
    checkAuth(Role.USER, Role.ADMIN),
    propertyController.acceptBid
);

export const propertyRoutes = router;