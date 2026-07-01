const Message = require("../models/Message");


const getPrivateChatHistory  = async (req,res)=>{
    try{
        const messages = await Message.find({
            $or:[
                {sender:req.user.userId , receiver:req.params.receiverId},

                {receiver:req.user.userId , sender:req.params.receiverId}
            ]
        }).populate("sender", "username").populate("receiver", "username").sort({createdAt: 1});

        res.status(200).json(messages);
    }catch(err){
        res.status(500).json(err)   
    }
}

const getPublicChatHistory  = async (req,res)=>{
    try{
        const messages = await Message.find({hubId : req.params.hubId}).populate("sender","username").sort({createdAt:1})

        res.status(200).json(messages)
    }catch(err){
        res.status(500).json(err)
    }
}




module.exports = {
  getPrivateChatHistory,
  getPublicChatHistory
};