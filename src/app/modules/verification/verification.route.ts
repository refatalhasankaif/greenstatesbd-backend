import { Router } from "express";
import { verificationController } from "./verification.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { verificationValidation } from "./verification.validation";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  checkAuth(Role.USER),
  validateRequest(verificationValidation.createVerificationRequestValidation),
  verificationController.createRequest
);

router.get(
  "/me",
  checkAuth(Role.USER),
  verificationController.getMyRequest
);

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.MANAGER, Role.MODERATOR),
  verificationController.getAllRequests
);

router.patch(
  "/:id/status",
  checkAuth(Role.ADMIN, Role.MANAGER, Role.MODERATOR),
  validateRequest(verificationValidation.updateVerificationStatusValidation),
  verificationController.updateStatus
);

export const verificationRoutes = router;