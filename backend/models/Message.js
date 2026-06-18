const mongoose  = require('mongoose');

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

   receiver:{
    type:mongoose.Schema.Types.ObjectId,
    ref: "User"
   }
    
  },

    { timestamps:true })


module.exports= mongoose.model('Message',MessageSchema);