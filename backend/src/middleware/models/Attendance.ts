import mongoose, { Document, Schema } from "mongoose";
export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  classCohort: mongoose.Types.ObjectId;
  date: Date;
  status: "Present" | "Absent" | "Late";
  createdAt?: Date;
  updatedAt?: Date;
}


const AttendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    classCohort: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["Present", "Absent", "Late"],
        required: true
    }
}, { timestamps: true });

export default mongoose.model<IAttendance>("Attendance",AttendanceSchema );
