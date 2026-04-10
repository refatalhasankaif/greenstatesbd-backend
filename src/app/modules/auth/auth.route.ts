import { Router } from "express";
import { authController } from "./auth.controller";
import { authValidation } from "./auth.validation";
import { validateRequest } from "../../middlewares/validateRequest";

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
    validateRequest(authValidation.socialAuthValidation),
    authController.social
);

export const authRoutes = router;