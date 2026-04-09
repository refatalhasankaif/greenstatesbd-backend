import { Router } from "express";
import { authController } from "./auth.controller";
import { authValidation } from "./auth.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/check-email",
  validateRequest(authValidation.checkEmailValidation),
  authController.checkEmail
);

router.post(
  "/register",
  validateRequest(authValidation.registerValidation),
  authController.register
);

router.post(
  "/login",
  validateRequest(authValidation.loginValidation),
  authController.login
);

router.post(
  "/social",
  checkAuth(Role.USER),
  validateRequest(authValidation.socialAuthValidation),
  authController.social
);

export const authRoutes = router;