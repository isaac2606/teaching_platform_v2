import mongoose, { Document, Schema } from "mongoose";
export interface IAssignment extends Document {
  title: string;
  description?: string;
  teacher: mongoose.Types.ObjectId;
  dueDate: Date;
  feedback?: string;
  hub: mongoose.Types.ObjectId;
  class?: mongoose.Types.ObjectId;
  type: "assignment" | "homework" | "quiz" | "project" | "exam";
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    totalPoints: {
      type: Number,
      default: 100,
    },
    attachments: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    hub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hub",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["assignment", "homework", "quiz", "project", "exam"],
      default: "assignment",
      required: true
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "published",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>("Assignment",assignmentSchema);