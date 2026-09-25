import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import app from "./app.js";
import { connectDB } from "./config/db.js";

// Load base .env
dotenv.config();

// Load .env.local ONLY for local development (NOT in CI/test)
if (process.env.NODE_ENV !== "test") {
  const envLocalPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
  }
}

// Port config
const PORT = process.env.PORT || 4000;

// ✅ PRIORITY FIX (CI first, then local)
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Validate Mongo URI
if (!MONGO_URI) {
  console.error("❌ No Mongo URI provided");
  process.exit(1);
}

// Debug (remove later if you want)
console.log("Using Mongo URI:", MONGO_URI);

// Start server
(async () => {
  try {
    await connectDB(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);

    // Don't crash in CI/test (so /health still works)
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down...");
    server.close(() => {
      console.log("Process terminated");
    });
  });
})();