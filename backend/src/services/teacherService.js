import { Teacher } from "../models/Teacher.js";
import { Section } from "../models/Section.js";

export const teacherService = {
  async createTeacher({ name, department, email, subjectIds }) {
    return Teacher.create({ name, department, email, subjects: subjectIds });
  },

  async listTeachers(department) {
    const query = department ? { department } : {};
    const teachers = await Teacher.find(query).populate("subjects", "subjectName subjectCode").lean();

    const sections = await Section.find(query).populate("subjects.subjectId", "subjectName subjectCode").lean();

    const assignedSubjectsMap = new Map();
    for (const section of sections) {
      for (const subject of section.subjects) {
        const teacherId = subject.teacherId.toString();
        if (!assignedSubjectsMap.has(teacherId)) {
          assignedSubjectsMap.set(teacherId, []);
        }
        assignedSubjectsMap.get(teacherId).push(subject.subjectId);
      }
    }

    return teachers.map((teacher) => ({
      ...teacher,
      assignedSubjects: assignedSubjectsMap.get(teacher._id.toString()) || [],
    }));
  },

  async updateTeacher(id, patch) {
    return Teacher.findByIdAndUpdate(id, patch, { new: true });
  },

  async deleteTeacher(id) {
    return Teacher.findByIdAndDelete(id);
  },
};
