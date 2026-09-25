import { DEFAULT_PERIODS_PER_DAY } from "../utils/constants.js";
import { generateTimetable } from "../utils/scheduler.js";
import { Routine } from "../models/Routine.js";
import { Section } from "../models/Section.js";
import { Subject } from "../models/Subject.js";
import { TeacherAssignmentHistory } from "../models/TeacherAssignmentHistory.js";
import { DAYS } from "../utils/constants.js";

export const routineService = {
  async generateRoutine({ department, year, periodsPerDay = DEFAULT_PERIODS_PER_DAY, sectionsInput }) {
    let sections = sectionsInput;
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      const fromDb = await Section.find({ department, year }).lean();
      const subjectIds = fromDb.flatMap((s) => s.subjects.map((x) => x.subjectId));
      const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean();
      const subjMap = new Map(subjects.map((s) => [String(s._id), s]));
      sections = fromDb.map((s) => ({
        name: s.name,
        holidays: s.holidays || [],
        subjects: s.subjects.map((sub) => ({
          subjectId: String(sub.subjectId),
          subjectName: subjMap.get(String(sub.subjectId))?.subjectName,
          subjectCode: subjMap.get(String(sub.subjectId))?.subjectCode,
          classesPerWeek: sub.classesPerWeek,
          teacherId: String(sub.teacherId),
        })),
      }));
    }

    // Ensure subject details present if input provided
    const missingSubjectIds = [];
    sections.forEach((sec) => {
      sec.subjects.forEach((s) => {
        if (!s.subjectName || !s.subjectCode) missingSubjectIds.push(s.subjectId);
      });
    });
    if (missingSubjectIds.length) {
      const uniq = [...new Set(missingSubjectIds)];
      const subjects = await Subject.find({ _id: { $in: uniq } }).lean();
      const subjMap = new Map(subjects.map((s) => [String(s._id), s]));
      sections.forEach((sec) => {
        sec.subjects.forEach((s) => {
          if (!s.subjectName || !s.subjectCode) {
            const sub = subjMap.get(String(s.subjectId));
            if (sub) {
              s.subjectName = sub.subjectName;
              s.subjectCode = sub.subjectCode;
            }
          }
        });
      });
    }

    const scheduled = generateTimetable({ department, year, periodsPerDay, sections });
    const meta = {
      periodsPerDay,
      days: DAYS,
      holidays: Object.fromEntries(sections.map((s) => [s.name, s.holidays || []]))
    };

    const routine = await Routine.findOneAndUpdate(
      { department, year },
      {
        department,
        year,
        periodsPerDay,
        sections: scheduled.sections,
        unsatisfied: scheduled.unsatisfied,
        meta,
      },
      { new: true, upsert: true }
    );

    // Persist teacher assignment history (best-effort)
    try {
      const docs = [];
      for (const sec of scheduled.sections) {
        for (const day of DAYS) {
          const arr = sec.timetable[day] || [];
          arr.forEach((slot, periodIndex) => {
            if (slot && slot.teacherId) {
              docs.push({
                teacherId: slot.teacherId,
                date: new Date(),
                day,
                periodIndex,
                sectionName: sec.name,
                routineId: routine._id,
              });
            }
          });
        }
      }
      if (docs.length) await TeacherAssignmentHistory.insertMany(docs);
    } catch (_) {
      // ignore history errors
    }

    return routine;
  },

  async getRoutine({ department, year }) {
    const routine = await Routine.findOne({ department, year }).lean();
    if (!routine) {
      const err = new Error("Routine not found");
      err.status = 404;
      throw err;
    }
    return routine;
  }
};
