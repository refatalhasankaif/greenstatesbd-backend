import { Router } from "express";
import { propertyRoutes } from "../modules/property/property.route";
import { aiRoutes } from "../modules/ai/ai.route";


const router = Router();

router.get("/test", (req, res) => {
  res.json({ message: "API route working" });
});

router.use("/ai", aiRoutes)
router.use("/properties", propertyRoutes)

export const IndexRoutes = router;