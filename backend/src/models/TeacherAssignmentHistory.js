import mongoose from "mongoose";

const TeacherAssignmentHistorySchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    date: { type: Date, required: true },
    day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], required: true },
    periodIndex: { type: Number, required: true },
    sectionName: { type: String, required: true },
    routineId: { type: mongoose.Schema.Types.ObjectId, ref: "Routine", required: true }
  },
  { timestamps: true }
);

export const TeacherAssignmentHistory = mongoose.model("TeacherAssignmentHistory", TeacherAssignmentHistorySchema);
