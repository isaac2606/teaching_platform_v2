import mongoose, { Document, Schema } from "mongoose";
export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  role: "student" | "teacher" | "admin";
  hubs: mongoose.Types.ObjectId[];
  students: mongoose.Types.ObjectId[];
  teachers: mongoose.Types.ObjectId[];
  recentUsers: mongoose.Types.ObjectId[];
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    hubs:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Hub" 
    }],
    students:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    teachers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    recentUsers:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
    }],
    refreshToken: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User",UserSchema );
