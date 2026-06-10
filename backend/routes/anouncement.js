const express = require("express");
const router = require("express").Router()

const User  =require("../models/User");
const Anouncement = require("../models/Anouncement");
const Group = require("../models/Group");

const bcrypt = require("bcrypt");

const verifyToken = require("../middleware/verifyToken");


router.post("/add", verifyToken,async (req,res)=>{


    try{
        // Ensure groupsIds is an array just in case a single string is sent
        const groupsIds = Array.isArray(req.body.groupsIds) ? req.body.groupId : [req.body.groupId];

        const anouncement = new Anouncement({
            title:req.body.title,
            description:req.body.description ,
            teacher:req.user.userId,
            groups:groupsIds
        })

        const savedAnouncement = await anouncement.save()
        
        // Update all associated groups efficiently in one query
        await Group.updateMany(
            { _id: { $in: groupsIds } },
            { $push: { anouncements: savedAnouncement._id } }
        );

        res.status(200).json({message:"anouncement added succesfully"})

    }catch(err){

            res.status(500).json(err)

    }

})


router.get("/getAnounc",verifyToken,async(req,res)=>{
    try{

        const anounc= await Anouncement.find({});

        res.status(200).json(anounc)


    }catch(err){
        res.status(500).json(err)
    }
})




router.get("/group/:groupId", verifyToken, async (req, res) => {
    try {
        // Find all announcements where the groups array contains this groupId
        const feed = await Anouncement.find({ groups: req.params.groupId });
        res.status(200).json(feed);
    } catch (err) {
        res.status(500).json(err);
    }
});




module.exports = router;