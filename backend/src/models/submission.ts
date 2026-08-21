import mongoose, { Document, Schema } from "mongoose";

export interface ISubmission extends Document {
  assignment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  content?: string;
  attachments?: string[];
  grade?: number;
  feedback?: string;
  status: "submitted" | "graded" | "returned";
  createdAt?: Date;
  updatedAt?: Date;
}

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String, // Text answer submitted by the student
    },
    attachments: [
      {
        type: String, // Cloudinary URLs for uploaded files
      },
    ],
    grade: {
      type: Number, // Score given by the teacher
    },
    feedback: {
      type: String, // Comments from the teacher
    },
    status: {
      type: String,
      enum: ["submitted", "graded", "returned"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

// Ensure a student can only submit once per assignment (optional but recommended)
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export default mongoose.model<ISubmission>("Submission", submissionSchema);
