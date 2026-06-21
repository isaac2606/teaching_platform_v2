const Message = require("../models/Message");


const getPrivateChatHistory  = async (req,res)=>{
    try{
        const messages = await Message.find({
            $or:[
                {sender:req.user._id , receiver:req.params.receiver},

                {receiver:req.user._id , sender:req.params.receiver}
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

const getUsersMessaging  = async (req,res)=>{
    try{
        // Find all private messages involving this user
        const messages = await Message.find({
            $or: [
                { sender: req.user._id },
                { receiver: req.user._id }
            ],
            // Ensure it's a private message (not a hub message)
            hubId: { $exists: false }
        })
        .populate("sender", "username email role")
        .populate("receiver", "username email role")
        .sort({ createdAt: -1 }); // Newest first

        // Extract unique contacts
        const contactsMap = new Map();

        messages.forEach((msg) => {
            // Determine who the *other* person is
            const isSender = msg.sender._id.toString() === req.user._id.toString();
            const contact = isSender ? msg.receiver : msg.sender;

            // Only add them if we haven't seen them yet (keeps the most recent message's order)
            if (contact && !contactsMap.has(contact._id.toString())) {
                contactsMap.set(contact._id.toString(), contact);
            }
        });

        const recentContacts = Array.from(contactsMap.values());
        res.status(200).json(recentContacts);

    }catch(err){
        console.error(err);
        res.status(500).json(err);
    }
}


module.exports = {
  getPrivateChatHistory,
  getPublicChatHistory,
  getUsersMessaging
};