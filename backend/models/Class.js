const mongoose  = require('mongoose');

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
    group:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Group",
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


module.exports= mongoose.model('Class',ClassSchema);