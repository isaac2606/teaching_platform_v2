import mongoose, { Document } from "mongoose";
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
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default _default;
//# sourceMappingURL=User.d.ts.map