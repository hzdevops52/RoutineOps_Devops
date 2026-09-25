import { asyncHandler } from "../middleware/asyncHandler.js";
import { teacherService } from "../services/teacherService.js";
import { ensureString, ensureArray } from "../utils/validation.js";

export const createTeacher = asyncHandler(async (req, res) => {
  const name = ensureString(req.body.name, "name");
  const department = ensureString(req.body.department, "department");
  const email = req.body.email ? String(req.body.email) : undefined;
  const subjectIds = Array.isArray(req.body.subjectIds) ? req.body.subjectIds : undefined;

  const teacher = await teacherService.createTeacher({ name, department, email, subjectIds });
  res.status(201).json(teacher);
});

export const listTeachers = asyncHandler(async (req, res) => {
  const { department } = req.query;
  const teachers = await teacherService.listTeachers(department);
  res.json(teachers);
});

export const updateTeacher = asyncHandler(async (req, res) => {
  const id = ensureString(req.params.id, "id");
  const patch = {};
  if (req.body.name != null) patch.name = ensureString(req.body.name, "name");
  if (req.body.email != null) patch.email = String(req.body.email);
  if (req.body.department != null) patch.department = ensureString(req.body.department, "department");
  if (req.body.subjectIds != null) patch.subjects = ensureArray(req.body.subjectIds, "subjectIds");

  const updated = await teacherService.updateTeacher(id, patch);
  if (!updated) {
    const err = new Error("Teacher not found");
    err.status = 404;
    throw err;
  }
  res.json(updated);
});

export const deleteTeacher = asyncHandler(async (req, res) => {
  const id = ensureString(req.params.id, "id");
  const deleted = await teacherService.deleteTeacher(id);
  if (!deleted) {
    const err = new Error("Teacher not found");
    err.status = 404;
    throw err;
  }
  res.json({ ok: true });
});
