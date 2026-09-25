export interface Subject {
  _id: string;
  subjectName: string;
  subjectCode: string;
  department: string;
}

export interface Teacher {
  _id: string;
  name: string;
  email?: string;
  department: string;
  subjects: Subject[]; // Teachable subjects
  assignedSubjects: Subject[];
}

export interface Section {
  _id: string;
  name: string;
  department: string;
  year: number;
  subjects: { subjectId: string; teacherId: string; classesPerWeek: number }[];
}
