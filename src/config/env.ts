import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || "",
  NODE_ENV: process.env.NODE_ENV || "development",
};

if (!ENV.DATABASE_URL && ENV.NODE_ENV !== "test") {
  console.warn("⚠️ Warning: DATABASE_URL is not set in environment variables.");
}
