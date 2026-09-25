import { Subject } from "../models/Subject.js";

export const subjectService = {
  async createSubject({ subjectName, subjectCode, department, defaultClassesPerWeek }) {
    const payload = { subjectName, subjectCode, department };
    if (defaultClassesPerWeek != null) payload.defaultClassesPerWeek = Number(defaultClassesPerWeek);
    const doc = await Subject.create(payload);
    return doc;
  },

  async listSubjects(department) {
    const filter = department ? { department } : {};
    return Subject.find(filter).lean();
  },
};
