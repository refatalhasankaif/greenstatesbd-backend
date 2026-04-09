import { Router } from "express";
import { propertyRoutes } from "../modules/property/property.route";


const router = Router();

router.get("/test", (req, res) => {
  res.json({ message: "API route working" });
});

router.use("/properties", propertyRoutes)

export const IndexRoutes = router;