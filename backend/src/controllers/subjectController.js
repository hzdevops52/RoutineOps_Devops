import { asyncHandler } from "../middleware/asyncHandler.js";
import { subjectService } from "../services/subjectService.js";
import { ensureString } from "../utils/validation.js";

export const createSubject = asyncHandler(async (req, res) => {
  const subjectName = ensureString(req.body.subjectName, "subjectName");
  const subjectCode = ensureString(req.body.subjectCode, "subjectCode");
  const department = ensureString(req.body.department, "department");
  const defaultClassesPerWeek = req.body.defaultClassesPerWeek != null ? Number(req.body.defaultClassesPerWeek) : undefined;
  const subject = await subjectService.createSubject({ subjectName, subjectCode, department, defaultClassesPerWeek });
  res.status(201).json(subject);
});

export const listSubjects = asyncHandler(async (req, res) => {
  const { department } = req.query;
  const subjects = await subjectService.listSubjects(department);
  res.json(subjects);
});
