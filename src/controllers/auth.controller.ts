import { Request, Response } from "express";
import { SignupUserService } from "../services/auth/signup.service";
import { LoginCredentialsService } from "../services/auth/login.service";
import { GetMeService } from "../services/auth/me.service";
import { UpdateMeService } from "../services/auth/update-me.service";

export class AuthController {
  // Credentials Registration
  public register = async (req: Request, res: Response) => {
    const { firstName, lastName, email, password, role, bio } = req.body ?? {};

    const result = await SignupUserService(firstName, lastName, email, password, role, bio);
    return res.status(result.code).json(result);
  };

  // Handle Login Account
  public login = async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    const result = await LoginCredentialsService(email, password);
    
    // Fallback: Set cookie if tokens are generated
    if (result.code === 200 && result.data?.token) {
      res.cookie("accessToken", result.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return res.status(result.code).json(result);
  };

  // Handle Logout
  public logout = (req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("token");
    return res.status(200).json({
      success: true,
      code: 200,
      status: "success",
      message: "Logged out successfully",
    });
  };

  // Get Current User Session
  public me = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: User ID not found in session" });
    }

    const result = await GetMeService(userId);
    return res.status(result.code).json(result);
  };

  // Update Profile & Preferences
  public updateMe = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: User ID not found in session" });
    }

    const result = await UpdateMeService(userId, req.body);
    return res.status(result.code).json(result);
  };
}

export const authController = new AuthController();
