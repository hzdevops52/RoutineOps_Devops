import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    department: { type: String, required: true, trim: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    availability: {
      type: [
        new mongoose.Schema(
          {
            day: {
              type: String,
              enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              required: true
            },
            periodsUnavailable: { type: [Number], default: [] }
          },
          { _id: false }
        )
      ],
      default: undefined
    }
  },
  { timestamps: true }
);

export const Teacher = mongoose.model("Teacher", TeacherSchema);
