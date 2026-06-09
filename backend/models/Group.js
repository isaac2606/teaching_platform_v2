const mongoose  = require('mongoose');

const GroupSchema = new mongoose.Schema({
    
    name:{
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
    anouncements:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Anouncement"
    }]
  },

    { timestamps:true })


module.exports= mongoose.model('Group',GroupSchema);