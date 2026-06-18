const mongoose  = require('mongoose');

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


module.exports= mongoose.model('Hub',HubSchema);