import { Router } from "express";
import { dashboardController } from "./dashboard.controller";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

router.get("/", checkAuth(), dashboardController.getDashboard);

export const dashboardRoutes = router;