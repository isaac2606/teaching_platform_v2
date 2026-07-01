import mongoose, { Document } from "mongoose";
export interface IHub extends Document {
    title: string;
    teacher: mongoose.Types.ObjectId;
    students: mongoose.Types.ObjectId[];
    announcements: mongoose.Types.ObjectId[];
    classes: mongoose.Types.ObjectId[];
    inviteToken?: string;
    messages: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}
declare const _default: mongoose.Model<IHub, {}, {}, {}, mongoose.Document<unknown, {}, IHub, {}, mongoose.DefaultSchemaOptions> & IHub & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IHub>;
export default _default;
//# sourceMappingURL=Hub.d.ts.map