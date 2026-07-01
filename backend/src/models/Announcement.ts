import mongoose, { Document, Schema } from "mongoose";
export interface IAnnouncement extends Document {
  title: string;
  description?: string;
  teacher: mongoose.Types.ObjectId;
  hubs: mongoose.Types.ObjectId[];
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


const AnnouncementSchema = new mongoose.Schema({
    
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    teacher:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    hubs:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Hub",
        required:true
 
    }],
    imageUrl:{
        type:String,
        default:""
    },

     
  },

    { timestamps:true })


export default mongoose.model<IAnnouncement>("Announcement",AnnouncementSchema );