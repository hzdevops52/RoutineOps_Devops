import { Router } from "express";
import { createTeacher, listTeachers, updateTeacher, deleteTeacher } from "../controllers/teacherController.js";

const router = Router();

router.route("/").post(createTeacher).get(listTeachers);
router.route("/:id").put(updateTeacher).delete(deleteTeacher);

export default router;
