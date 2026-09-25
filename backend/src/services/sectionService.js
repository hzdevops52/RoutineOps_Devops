import { Section } from "../models/Section.js";

export const sectionService = {
  async createSections({ department, year, names }) {
    const created = [];
    for (const name of names) {
      const doc = await Section.findOneAndUpdate(
        { department, year, name },
        { $setOnInsert: { department, year, name, subjects: [], holidays: [] } },
        { new: true, upsert: true }
      );
      created.push(doc);
    }
    return created;
  },

  async setSubjectsAndHolidays({ sectionId, subjects, holidays }) {
    const section = await Section.findById(sectionId);
    if (!section) {
      const err = new Error("Section not found");
      err.status = 404;
      throw err;
    }
    section.subjects = subjects.map((s) => ({
      subjectId: s.subjectId,
      classesPerWeek: s.classesPerWeek,
      teacherId: s.teacherId,
    }));
    if (Array.isArray(holidays)) {
      section.holidays = holidays;
    }
    await section.save();
    return section.toObject();
  },

  async listByDepartmentYear({ department, year }) {
    const query = {};
    if (department != null) query.department = department;
    if (year != null) query.year = year;
    return Section.find(query).lean();
  }
};
