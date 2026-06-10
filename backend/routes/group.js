const express = require("express");
const User = require("../models/User");
const router = express.Router();
const Group = require("../models/Group");
const crypto = require("crypto")
const verifyToken = require("../middleware/verifyToken")
const authorize = require("../middleware/roleMiddleware")

//create a group
router.post("/", verifyToken, authorize("teacher"), async (req , res)=>{

    try{
        const inviteToken = crypto.randomBytes(8).toString('hex');
        const group =  new Group({
            title:req.body.title,
            teacher: req.user.userId,
            inviteToken:inviteToken
            });
        const savedPost = await group.save();
        res.status(201).json(savedPost)
    }catch(err){
        res.status(500).json(err)
    }
})

//join a group

router.put("/:id/join", verifyToken ,authorize("student"),async(req,res)=>{
    try{
        const group = await Group.findById(req.params.id);
        
        if(!group.students.includes(req.user.userId)){
            await group.updateOne({$push:{students: req.user.userId }})
            res.status(200).json("student joined the group")
        }else{
            res.status(200).json("student already in the group")
        }
    }catch(err){
        
        res.status(500).json(err)
    }
}
)
//leave a group
router.put("/:id/leave", verifyToken ,authorize("student"),async(req,res)=>{
    try{
        const group = await Group.findById(req.params.id);
        
        if(group.students.includes(req.user.userId)){
            await group.updateOne({$pull:{students: req.user.userId }})
            res.status(200).json("student left the group")
        }else{
            res.status(200).json("student was not in the group")
        }
    }catch(err){
        
        res.status(500).json(err)
    }
}
)

//get ALL groups
router.get("/getGroups",verifyToken,async(req,res)=>{
    try{

        const groups= await Group.find({});

        res.status(200).json(groups)


    }catch(err){
        res.status(500).json(err)
    }
})


router.put("/:id",verifyToken,authorize("teacher"),async (req,res)=>{

    try{
        const updatedGroup = await Group.findByIdAndUpdate(
            req.params.id,
            {   $set:{title:req.body.title} },
            {   new: true    });
        res.status(200).json(updatedGroup);
    }catch(err){
        res.status(500).json(err)
    }

})


router.delete("/:id",verifyToken,authorize("teacher",async (req,res)=>{

    try{

        await Group.findByIdAndDelete(req.params.id);
        res.status(200).json("Group has been deleted")

    }catch(err){
        res.status(500).json(err)
    }
}))
module.exports = router;