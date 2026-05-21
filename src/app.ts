import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorMiddleware } from "./middlewares/error-middleware";
import { ENV } from "./config/env";

const app = express();

// --- Core Middleware ---
app.use(
  cors({
    origin: true, // Allow frontend dynamically
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Health Check ---
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "EssayMind API is healthy",
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
  });
});

// --- Register Routes ---
app.use("/api", routes);

// --- 404 Handler ---
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// --- Global Error Handler ---
app.use(errorMiddleware);

export default app;
