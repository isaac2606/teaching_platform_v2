import mongoose, { Document, Schema } from "mongoose";
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


const ClassSchema = new mongoose.Schema({
    
    title:{
        type:String,
        required:true
    },
    teacher:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    hub:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Hub",
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
    date:{
        type:String
    },
    imageUrl:{
        type:String,
        default:""
    },
    type: {
        type: String,
        default: "Live Video"
    },
    duration: {
        type: String,
        default: "1h 00m"
    },
    inviteToken:{
        type:String,
        unique:true,
        sparse:true
    },
    dues:{
        type:Number,
        default:0
    },
    
    

    
  },

    { timestamps:true })


export default mongoose.model<IClass>("Class",ClassSchema );