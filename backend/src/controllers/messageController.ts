import { Request, Response } from "express";
import Message from "../models/Message";


const getPrivateChatHistory  = async (req: Request, res: Response)=>{
    try{
        const messages = await Message.find({
            $or:[
                {sender:req.user.userId , receiver:req.params.receiverId},

                {receiver:req.user.userId , sender:req.params.receiverId}
            ]
        }).populate("sender", "username").populate("receiver", "username").sort({createdAt: 1});

        res.status(200).json(messages);
    }catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
}

const getPublicChatHistory  = async (req: Request, res: Response)=>{
    try{
        const messages = await Message.find({hubId : req.params.hubId}).populate("sender","username").sort({createdAt:1})

        res.status(200).json(messages)
    }catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
}




export {
  getPrivateChatHistory,
  getPublicChatHistory
};