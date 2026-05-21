import app from "./app";
import { ENV } from "./config/env";

const startServer = () => {
  try {
    app.listen(ENV.PORT, () => {
      console.log("--------------------------------------------------");
      console.log(`🚀 StudyMate Started Successfully!`);
      console.log(`📡 PORT: ${ENV.PORT}`);
      console.log(`🌍 MODE: ${ENV.NODE_ENV}`);
      console.log("--------------------------------------------------");
    });
  } catch (error) {
    console.error("❌ CRITICAL: Could not start the StudyMate server:", error);
    process.exit(1);
  }
};

startServer();
