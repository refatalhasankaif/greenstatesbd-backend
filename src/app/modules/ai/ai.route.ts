import { Router } from "express";
import { aiController } from "./ai.controller";

const router = Router();

router.post("/chat", aiController.chatWithAI);

export const aiRoutes = router;