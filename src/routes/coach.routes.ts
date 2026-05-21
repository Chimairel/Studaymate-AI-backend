import { Router } from "express";
import { coachController } from "../controllers/coach.controller";
import { authMiddleware } from "../middlewares/auth-middleware";
import { validateSchema } from "../middlewares/validate-schema";
import { analyzeCoachSchema, chatCoachSchema, scoreCoachSchema } from "../schema/coach.schema";

const router = Router();

// Apply Authentication to all AI Coach routes
router.use(authMiddleware.execute);

// AI Coach Endpoints
router.post("/analyze", validateSchema(analyzeCoachSchema), coachController.analyze);
router.post("/chat", validateSchema(chatCoachSchema), coachController.chat);
router.post("/score", validateSchema(scoreCoachSchema), coachController.score);

export default router;
