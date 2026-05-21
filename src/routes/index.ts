import { Router } from "express";
import authRoutes from "./auth.routes";
import essayRoutes from "./essay.routes";
import coachRoutes from "./coach.routes";
import statsRoutes from "./stats.routes";

const router = Router();

// Mount API sub-routers
router.use("/auth", authRoutes);
router.use("/essays", essayRoutes);
router.use("/coach", coachRoutes);
router.use("/stats", statsRoutes);

export default router;
