import mongoose, { Document, Schema } from "mongoose";

export interface IMembership extends Document {
    user: mongoose.Types.ObjectId,
    hub: mongoose.Types.ObjectId,
    role: "owner" | "co_teacher" | "student"
}

const MembershipSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    hub: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hub",
        required: true,
    },
    role: {
        type: String,
        enum: ["student", "co_teacher", "owner"],
        default: "student",
    }
}, { timestamps: true });

MembershipSchema.index({ user: 1, hub: 1 }, { unique: true });

export default mongoose.model<IMembership>("Membership", MembershipSchema);