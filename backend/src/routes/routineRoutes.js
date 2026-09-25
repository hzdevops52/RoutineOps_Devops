import { Router } from "express";
import { generateRoutine, getSchedule } from "../controllers/routineController.js";

const router = Router();

router.route("/").post(generateRoutine).get(getSchedule);

export default router;
