import { Request, Response } from "express";
import { SignupUserService } from "../services/auth/signup.service";
import { LoginCredentialsService } from "../services/auth/login.service";

export class AuthController {
  // Credentials Signup
  public signup = async (req: Request, res: Response) => {
    const { name, email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ code: 400, status: "error", message: "Email and password are required" });
    }

    const result = await SignupUserService(name, email, password);
    return res.status(result.code).json(result);
  };

  // Handle Login Account
  public login = async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ code: 400, status: "error", message: "Email and password are required" });
    }

    const result = await LoginCredentialsService(email, password);
    return res.status(result.code).json(result);
  };

    // Handle Logout
  public logout = (req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json({ code: 200, status: "success", message: "Logged out successfully" });
  };
}
