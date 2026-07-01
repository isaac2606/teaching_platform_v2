const fs = require('fs');
const path = require('path');

const modelsDir = 'c:\\Users\\Bestpc.tn\\teaching_platform_v2\\backend\\src\\models';

const modelsData = {
    'User': `
export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  role: "student" | "teacher" | "admin";
  hubs: mongoose.Types.ObjectId[];
  recentUsers: mongoose.Types.ObjectId[];
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
`,
    'Message': `
export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  text: string;
  hubId?: mongoose.Types.ObjectId;
  receiver?: mongoose.Types.ObjectId;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
`,
    'Hub': `
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
`,
    'Class': `
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
`,
    'Announcement': `
export interface IAnnouncement extends Document {
  title: string;
  description?: string;
  teacher: mongoose.Types.ObjectId;
  hubs: mongoose.Types.ObjectId[];
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
`,
    'Attendance': `
export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  classCohort: mongoose.Types.ObjectId;
  date: Date;
  status: "Present" | "Absent" | "Late";
  createdAt?: Date;
  updatedAt?: Date;
}
`
};

for (const [modelName, interfaceStr] of Object.entries(modelsData)) {
    const jsPath = path.join(modelsDir, modelName + '.js');
    if (fs.existsSync(jsPath)) {
        let content = fs.readFileSync(jsPath, 'utf8');

        content = content.replace(/const\s+mongoose\s*=\s*require\(['\`"]mongoose['\`"]\);?/, 'import mongoose, { Document, Schema } from "mongoose";');
        content = content.replace(/(import mongoose.+?;)/, '$1\\n' + interfaceStr);
        
        const exportRegex = new RegExp('module\\\\.exports\\\\s*=\\\\s*mongoose\\\\.model\\\\([\\\'\\"\`]' + modelName + '[\\\'\\"\`],\\\\s*([a-zA-Z0-9_]+)\\\\);?');
        content = content.replace(exportRegex, 'export default mongoose.model<I' + modelName + '>("' + modelName + '", $1);');

        const tsPath = path.join(modelsDir, modelName + '.ts');
        fs.writeFileSync(tsPath, content);
        fs.unlinkSync(jsPath);
        console.log('Refactored ' + modelName);
    }
}
