import { asyncHandler } from "../middleware/asyncHandler.js";
import { routineService } from "../services/routineService.js";
import { ensureString, ensureNumber } from "../utils/validation.js";
import { Routine } from "../models/Routine.js";

export const generateRoutine = asyncHandler(async (req, res) => {
  const department = ensureString(req.body.department, "department");
  const year = ensureNumber(req.body.year, "year", { min: 1, max: 4 });
  const periodsPerDay = req.body.periodsPerDay ? ensureNumber(req.body.periodsPerDay, "periodsPerDay", { min: 1 }) : undefined;

  const sectionsInput = Array.isArray(req.body.sections)
    ? req.body.sections
        .map((s, idx) => {
          const sectionNameCandidate = typeof (s.name ?? s.sectionName) === "string" ? (s.name ?? s.sectionName).trim() : "";
          const sectionName = sectionNameCandidate.length > 0 ? sectionNameCandidate : String.fromCharCode(65 + idx);

          const subjects = (s.subjects || [])
            .map((sub) => {
              const subjectIdRaw = sub.subjectId ?? sub.id ?? sub._id;
              const teacherIdRaw = sub.teacherId ?? sub.assignedTeacher ?? sub.teacher?._id;
              const weeklyRaw = sub.classesPerWeek ?? sub.weekly;

              if (!subjectIdRaw || !teacherIdRaw || weeklyRaw == null) {
                return null;
              }

              const classesPerWeek = ensureNumber(weeklyRaw, "classesPerWeek", { min: 0 });
              if (classesPerWeek === 0) return null;

              const subjectName = typeof sub.subjectName === "string" ? sub.subjectName.trim() : sub.name?.trim();
              const subjectCode = typeof sub.subjectCode === "string" ? sub.subjectCode.trim() : sub.code?.trim();
              const teacherName = typeof sub.teacherName === "string" ? sub.teacherName.trim() : sub.teacher?.name?.trim();

              return {
                subjectId: ensureString(subjectIdRaw, "subjectId"),
                subjectName,
                subjectCode,
                teacherId: ensureString(teacherIdRaw, "teacherId"),
                teacherName,
                classesPerWeek,
              };
            })
            .filter(Boolean);

          return {
            sectionId: s.sectionId ? String(s.sectionId) : undefined,
            name: sectionName,
            holidays: Array.isArray(s.holidays) ? s.holidays : undefined,
            subjects,
          };
        })
        .filter((sec) => sec.subjects.length > 0)
    : undefined;

  if (!sectionsInput || sectionsInput.length === 0) {
    const err = new Error("At least one section with subjects is required");
    err.status = 400;
    throw err;
  }

  const routine = await routineService.generateRoutine({
    department,
    year,
    periodsPerDay,
    sectionsInput,
  });
  res.status(201).json(routine);
});

export const getSchedule = asyncHandler(async (req, res) => {
  const { department, year } = req.query;

  if (department && year) {
    const dep = ensureString(department, "department");
    const yr = ensureNumber(year, "year", { min: 1, max: 4 });
    try {
      const routine = await routineService.getRoutine({ department: dep, year: yr });
      return res.json(routine);
    } catch (e) {
      return res.status(200).json({ department: dep, year: yr, sections: [], meta: { message: "No routine yet" } });
    }
  }

  const latest = await Routine.findOne({}).sort({ updatedAt: -1 }).lean();
  if (!latest) {
    return res.status(200).json({ sections: [], meta: { message: "No schedules found" } });
  }
  return res.json(latest);
});
