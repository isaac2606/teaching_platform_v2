const express = require("express");
const router = require("express").Router()

const User  =require("../models/User");
const Announcement = require("../models/Announcement");
const Group = require("../models/Group");

const bcrypt = require("bcrypt");

const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/upload");



//create an announcement
router.post("/add", verifyToken , upload.single("image") ,async (req,res)=>{

    try{
        // Ensure groupsIds is an array just in case a single string is sent
        const groupsIds = Array.isArray(req.body.groupsIds) ? req.body.groupsIds : [req.body.groupsIds];
        const imagePath = req.file ? req.file.filename:"";

        const announcement = new Announcement({
            title:req.body.title,
            description:req.body.description ,
            teacher:req.user.userId,
            imageUrl:imagePath,
            groups:groupsIds
        })

        const savedAnnouncement = await announcement.save()
        
        // Update all associated groups efficiently in one query
        await Group.updateMany(
            { _id: { $in: groupsIds } },
            { $push: { announcements: savedAnnouncement._id } }
        );

        res.status(200).json({message:"announcement added succesfully"
            ,announcement: savedAnnouncement
        });

    }catch(err){

            res.status(500).json(err)

    }

})


router.get("/getAnounc",verifyToken,async(req,res)=>{
    try{

        const anounc= await Announcement.find({});

        res.status(200).json(anounc)


    }catch(err){
        res.status(500).json(err)
    }
})




router.get("/group/:groupId", verifyToken, async (req, res) => {
    try {
        // Find all announcements where the groups array contains this groupId
        const feed = await Announcement.find({ groups: req.params.groupId })
        .populate("teacher","email");
        res.status(200).json(feed);
    } catch (err) {
        res.status(500).json(err);
    }
});




module.exports = router;