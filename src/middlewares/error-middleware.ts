import { Request, Response, NextFunction } from "express";
import { ENV } from "../config/env";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (ENV.NODE_ENV === "development") {
    console.error("🔥 Error Handler Caught Error:", err);
  } else {
    console.error(`🔥 Error Handler: ${message}`);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(ENV.NODE_ENV === "development" && { stack: err.stack }),
  });
};
