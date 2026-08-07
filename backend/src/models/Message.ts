import mongoose, { Document, Schema } from "mongoose";
export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  text: string;
  hubId?: mongoose.Types.ObjectId;
  channel?: string;
  receiver?: mongoose.Types.ObjectId;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


const MessageSchema = new mongoose.Schema({
    
   sender:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
   },
   text:{
    type:String,
    required:true
   },

   hubId:{
    type:mongoose.Schema.Types.ObjectId,
    ref: "Hub"
   },
   channel:{
    type: String, // e.g. "general" or "homework"
    default: "general"
   },

   receiver:{
    type:mongoose.Schema.Types.ObjectId,
    ref: "User"
   },
   imageUrl:{
    type:String,
    default:""
   }
    
  },

    { timestamps:true })


export default mongoose.model<IMessage>("Message",MessageSchema );