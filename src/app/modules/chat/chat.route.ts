import { Router } from "express";
import { chatController } from "./chat.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/send",
  checkAuth(Role.USER, Role.ADMIN, Role.MANAGER),
  chatController.sendMessage
);

router.get(
  "/:id",
  checkAuth(),
  chatController.getMessages
);

router.get(
  "/",
  checkAuth(),
  chatController.getMyConversations
);

export const chatRoutes = router;