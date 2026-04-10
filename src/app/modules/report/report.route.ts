import { Router } from "express";
import { reportController } from "./report.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { reportValidation } from "./report.validation";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  checkAuth(Role.USER),
  validateRequest(reportValidation.createReportValidation),
  reportController.createReport
);

router.get(
  "/me",
  checkAuth(Role.USER),
  reportController.getMyReports
);

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.MANAGER, Role.MODERATOR),
  reportController.getAllReports
);

router.patch(
  "/:id/status",
  checkAuth(Role.ADMIN, Role.MANAGER, Role.MODERATOR),
  validateRequest(reportValidation.updateReportStatusValidation),
  reportController.updateReportStatus
);

export const reportRoutes = router;