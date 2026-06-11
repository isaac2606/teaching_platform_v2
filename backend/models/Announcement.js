const mongoose  = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    teacher:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    groups:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Group",
        required:true
 
    }],
    imageUrl:{
        type:String,
        default:""
    },

     
  },

    { timestamps:true })


module.exports= mongoose.model('Announcement',AnnouncementSchema);