import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../lib/jwt";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  userId?: string;
}

export class AuthMiddleware {
  public execute = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token = this.extractBearerToken(req.headers.authorization);

    console.log(`[AuthMiddleware] Received Request: ${req.method} ${req.originalUrl}`);
    console.log(`[AuthMiddleware] Authorization Header:`, req.headers.authorization ? `${req.headers.authorization.substring(0, 20)}...` : 'undefined');

    // Fallback to Cookies if available
    if (!token && req.cookies) {
      token = req.cookies.accessToken || req.cookies.token;
      console.log(`[AuthMiddleware] Fallback to cookie token found:`, !!token);
    }

    if (!token) {
      console.warn(`[AuthMiddleware] Request rejected: Token is missing.`);
      return res.status(401).json({
        success: false,
        message: "Authentication required. Token is missing.",
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.warn(`[AuthMiddleware] Request rejected: Invalid or expired token. Token:`, `${token.substring(0, 15)}...`);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    console.log(`[AuthMiddleware] Request authorized successfully. User:`, decoded.email);
    req.user = decoded;
    req.userId = decoded.sub;
    return next();
  };


  private extractBearerToken(header?: string): string | undefined {
    if (!header) return undefined;
    const [scheme, token] = header.split(" ");
    if (!scheme || scheme.toLowerCase() !== "bearer" || !token) return undefined;
    return token.trim();
  }
}

export const authMiddleware = new AuthMiddleware();
