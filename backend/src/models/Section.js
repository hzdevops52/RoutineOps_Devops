import mongoose from "mongoose";

const SectionSubjectSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    classesPerWeek: { type: Number, required: true, min: 0 },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true }
  },
  { _id: false }
);

const SectionSchema = new mongoose.Schema(
  {
    department: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1, max: 4 },
    name: { type: String, required: true, trim: true },
    subjects: { type: [SectionSubjectSchema], default: [] },
    holidays: {
      type: [String],
      default: [],
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }
  },
  { timestamps: true }
);

SectionSchema.index({ department: 1, year: 1, name: 1 }, { unique: true });

export const Section = mongoose.model("Section", SectionSchema);
