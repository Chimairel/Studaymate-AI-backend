import { Router } from "express";
import { statsController } from "../controllers/stats.controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = Router();

// Apply Authentication to all Stats routes
router.use(authMiddleware.execute);

// Stats Endpoints
router.get("/dashboard", statsController.dashboard);
router.get("/progress", statsController.progress);
router.get("/achievements", statsController.achievements);

export default router;
