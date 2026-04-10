import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { userValidation } from "./user.validation";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get(
  "/me",
  checkAuth(
    Role.USER,
    Role.ADMIN,
    Role.MANAGER,
    Role.MODERATOR,
    Role.SUPPORT_AGENT
  ),
  userController.getMyProfile
);

router.patch(
  "/me",
  checkAuth(
    Role.USER,
    Role.ADMIN,
    Role.MANAGER,
    Role.MODERATOR,
    Role.SUPPORT_AGENT
  ),
  validateRequest(userValidation.updateProfileValidation),
  userController.updateProfile
);

router.get(
  "/",
  checkAuth(Role.ADMIN),
  userController.getAllUsers
);

router.get(
  "/:id",
  checkAuth(Role.ADMIN),
  userController.getUserById
);

router.patch(
  "/:id/role",
  checkAuth(Role.ADMIN),
  validateRequest(userValidation.updateUserRoleValidation),
  userController.updateUserRole
);

router.patch(
  "/:id/block",
  checkAuth(Role.ADMIN),
  validateRequest(userValidation.blockUserValidation),
  userController.toggleBlockUser
);

export const userRoutes = router;