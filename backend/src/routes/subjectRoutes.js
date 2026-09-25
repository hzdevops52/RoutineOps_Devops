import { Router } from "express";
import { createSubject, listSubjects } from "../controllers/subjectController.js";

const router = Router();

router.route("/").post(createSubject).get(listSubjects);

export default router;
