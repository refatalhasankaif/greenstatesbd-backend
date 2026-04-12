import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { aiController } from "./ai.controller";

const router = Router();

router.post("/chat", aiController.chat);
router.post("/blog", checkAuth(), aiController.generateBlog);

export const aiRoutes = router;