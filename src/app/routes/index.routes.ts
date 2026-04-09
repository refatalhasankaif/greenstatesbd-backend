import { Router } from "express";
import { PropertyRoutes } from "../modules/property/property.route";

const router = Router();

router.get("/test", (req, res) => {
  res.json({ message: "API route working" });
});

router.use("/properties", PropertyRoutes)

export const IndexRoutes = router;