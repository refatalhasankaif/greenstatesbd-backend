import { Router } from "express";

import { checkAuth } from "../../middlewares/checkAuth";
import { aiController } from "./ai.controller";

const router = Router();

router.post("/chat", checkAuth(), aiController.chat);
router.post("/blog/generate", checkAuth(), aiController.generateBlog);
router.get("/blog/ideas", checkAuth(), aiController.blogIdeas);
router.post("/voice", checkAuth(), aiController.voice);

export const aiRoutes = router;