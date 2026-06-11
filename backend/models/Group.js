const mongoose  = require('mongoose');

const GroupSchema = new mongoose.Schema({
    
    title:{
        type:String,
        required:true
    },
    teacher:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    inviteToken:{
        type:String,
        
        unique:true
    },
    students:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
 
    }], 
    announcements:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Announcement"
    }]
  },

    { timestamps:true })


module.exports= mongoose.model('Group',GroupSchema);