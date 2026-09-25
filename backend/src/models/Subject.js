import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    subjectName: { type: String, required: true, trim: true },
    subjectCode: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    defaultClassesPerWeek: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

SubjectSchema.index({ subjectCode: 1, department: 1 }, { unique: true });

export const Subject = mongoose.model("Subject", SubjectSchema);
