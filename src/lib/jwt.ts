import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload, expiresIn: string = ENV.JWT_EXPIRES_IN): string {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
  } catch (error) {
    console.error("verifyToken error:", error);
    return null;
  }
}

