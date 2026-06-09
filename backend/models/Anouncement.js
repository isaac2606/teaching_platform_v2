const mongoose  = require('mongoose');

const AnouncementSchema = new mongoose.Schema({
    
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
     
  },

    { timestamps:true })


module.exports= mongoose.model('Anouncement',AnouncementSchema);