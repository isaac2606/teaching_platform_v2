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
    default:""
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

    { timestamps:true });

// ⚡ Compound Indexes for O(log N) cursor-based pagination
MessageSchema.index({ hubId: 1, channel: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

export default mongoose.model<IMessage>("Message",MessageSchema );