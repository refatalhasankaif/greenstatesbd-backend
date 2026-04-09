import { Router } from "express";
import { propertyRoutes } from "../modules/property/property.route";
import { aiRoutes } from "../modules/ai/ai.route";
import { authRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import { reportRoutes } from "../modules/report/report.route";
import { bidRoutes } from "../modules/bid/bid.route";

const router = Router();

router.get("/test", (req, res) => {
  res.json({ message: "API route working...." });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/properties", propertyRoutes);
router.use("/bids", bidRoutes);
router.use("/reports", reportRoutes);
router.use("/ai", aiRoutes);

export const IndexRoutes = router;