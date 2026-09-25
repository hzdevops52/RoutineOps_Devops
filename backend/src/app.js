import express from "express";
import morgan from "morgan";
import cors from "cors";
import teacherRoutes from "./routes/teacherRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js";
import routineRoutes from "./routes/routineRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "").split(",").filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Health
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// API base path matches frontend axios baseURL (/api)
app.use("/api/teachers", teacherRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/routines", routineRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
