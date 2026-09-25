import { asyncHandler } from "../middleware/asyncHandler.js";
import { sectionService } from "../services/sectionService.js";
import { ensureString, ensureNumber, ensureArray } from "../utils/validation.js";

export const createSections = asyncHandler(async (req, res) => {
  const department = ensureString(req.body.department, "department");
  const year = ensureNumber(req.body.year, "year", { min: 1, max: 4 });
  const names = req.body.sections
    ? ensureArray(req.body.sections, "sections").map((n) => ensureString(n, "sections[]"))
    : [ensureString(req.body.name ?? req.body.sectionName, "name")];

  const created = await sectionService.createSections({ department, year, names });
  res.status(201).json(created);
});

export const addSubjects = asyncHandler(async (req, res) => {
  const sectionId = ensureString(req.params.id ?? req.body.sectionId, "sectionId");
  const subjects = ensureArray(req.body.subjects, "subjects").map((s) => ({
    subjectId: ensureString(s.subjectId, "subjectId"),
    classesPerWeek: ensureNumber(s.classesPerWeek, "classesPerWeek", { min: 0 }),
    teacherId: ensureString(s.teacherId, "teacherId"),
  }));
  const holidays = req.body.holidays ? ensureArray(req.body.holidays, "holidays") : undefined;

  const updated = await sectionService.setSubjectsAndHolidays({ sectionId, subjects, holidays });
  res.json(updated);
});

export const listSections = asyncHandler(async (req, res) => {
  const { department, year } = req.query;
  // Optional filters: validate only if provided
  const dep = department != null && department !== "" ? ensureString(department, "department") : undefined;
  const yr = year != null && year !== "" ? ensureNumber(year, "year", { min: 1, max: 4 }) : undefined;
  const sections = await sectionService.listByDepartmentYear({ department: dep, year: yr });
  res.json(sections);
});
