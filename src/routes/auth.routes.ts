import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth-middleware";
import { validateSchema } from "../middlewares/validate-schema";
import { registerSchema, loginSchema, updateMeSchema } from "../schema/auth.schema";

const router = Router();

// Authentication Endpoints
router.post("/register", validateSchema(registerSchema), authController.register);
router.post("/signup", validateSchema(registerSchema), authController.register); // Alias for compatibility
router.post("/login", validateSchema(loginSchema), authController.login);
router.post("/logout", authController.logout);

// V1 Namespace Aliases (For Frontend Sync)
router.post("/v1/register", validateSchema(registerSchema), authController.register);
router.post("/v1/signup", validateSchema(registerSchema), authController.register);
router.post("/v1/login", validateSchema(loginSchema), authController.login);
router.post("/v1/logout", authController.logout);

// Profile Endpoints
router.get("/me", authMiddleware.execute, authController.me);
router.put("/me", authMiddleware.execute, validateSchema(updateMeSchema), authController.updateMe);

// V1 Profile Aliases (For Frontend Sync)
router.get("/v1/me", authMiddleware.execute, authController.me);
router.put("/v1/me", authMiddleware.execute, validateSchema(updateMeSchema), authController.updateMe);


export default router;
