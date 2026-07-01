import mongoose, { Document, Schema } from "mongoose";
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


const HubSchema = new mongoose.Schema({
    
    title:{
        type:String,
        required:true
    },
    teacher:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    students:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
 
    }], 
    announcements:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Announcement"
    }],
    classes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Class"
    }],
    inviteToken:{
        type:String,
        unique:true,
        
    },
    messages:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Message"
        }
    ]
    
  },

    { timestamps:true })


export default mongoose.model<IHub>("Hub", HubSchema );