import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import { propertyRoutes } from "../modules/property/property.route";
import { bidRoutes } from "../modules/bid/bid.route";
import { reportRoutes } from "../modules/report/report.route";
import { blogRoutes } from "../modules/blog/blog.route";
import { galleryRoutes } from "../modules/gallery/gallery.routes";
import { aiRoutes } from "../modules/ai/ai.route";
import { dashboardRoutes } from "../modules/dashboard/dashboard.route";

const router = Router();

router.get("/test", (_req, res) => {
  res.json({ message: "API route working...." });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/properties", propertyRoutes);
router.use("/bids", bidRoutes);
router.use("/reports", reportRoutes);
router.use("/blogs", blogRoutes);
router.use("/gallery", galleryRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/ai", aiRoutes);

export const IndexRoutes = router;