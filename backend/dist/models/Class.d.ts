import mongoose, { Document } from "mongoose";
export interface IClass extends Document {
    title: string;
    teacher: mongoose.Types.ObjectId;
    hub: mongoose.Types.ObjectId;
    students: mongoose.Types.ObjectId[];
    announcements: mongoose.Types.ObjectId[];
    date?: string;
    imageUrl?: string;
    type?: string;
    duration?: string;
    inviteToken?: string;
    dues?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
declare const _default: mongoose.Model<IClass, {}, {}, {}, mongoose.Document<unknown, {}, IClass, {}, mongoose.DefaultSchemaOptions> & IClass & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IClass>;
export default _default;
//# sourceMappingURL=Class.d.ts.map