import { Router } from "express";
import { supportController } from "./support.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", checkAuth(Role.USER), supportController.requestSupport);

router.patch(
  "/:id/accept",
  checkAuth(Role.SUPPORT_AGENT),
  supportController.acceptSession
);

router.patch(
  "/:id/reject",
  checkAuth(Role.SUPPORT_AGENT),
  supportController.rejectSession
);

router.patch("/:id/end", checkAuth(), supportController.endSession);

export const supportRoutes = router;