import { Router } from "express";
import { createSections, addSubjects, listSections } from "../controllers/sectionController.js";

const router = Router();

router.route("/").post(createSections).get(listSections);
router.route("/:id/subjects").post(addSubjects);

export default router;
