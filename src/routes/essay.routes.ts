import { Router } from "express";
import { essayController } from "../controllers/essay.controller";
import { authMiddleware } from "../middlewares/auth-middleware";
import { validateSchema } from "../middlewares/validate-schema";
import { createEssaySchema, updateEssaySchema } from "../schema/essay.schema";

const router = Router();

// Apply Authentication to all Essay routes
router.use(authMiddleware.execute);

// Essay Endpoints
router.get("/", essayController.getAll);
router.post("/", validateSchema(createEssaySchema), essayController.create);
router.get("/:id", essayController.getOne);
router.put("/:id", validateSchema(updateEssaySchema), essayController.update);
router.delete("/:id", essayController.delete);
router.patch("/:id/feedback/:feedbackId", essayController.updateFeedback);

export default router;
