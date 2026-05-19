import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

// Authentication Routes
router.post("/v1/signup", authController.signup);
router.post("/v1/login", authController.login);

export default router;
