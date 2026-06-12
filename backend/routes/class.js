const express = require("express");
const router = require("express").Router()

const User =require("../models/User");
const Announcement = require("../models/Announcement");
const Group = require("../models/Group");
const Class = require("../models/Class")

const verifyToken = require("../middleware/verifyToken");
const roleMiddleware = require("../middleware/roleMiddleware");


//create a class

router.post("/createClass",verifyToken,roleMiddleware("teacher"),async(req,res)=>{

    try{

        const newClass = new Class({
            title:req.body.title,
            teacher:req.user.userId,
            group:req.body.groupId,
        })

        const savedClass= await newClass.save()

        const group = await Group.findByIdAndUpdate(req.body.groupId,{ 
            $push: { classes: savedClass._id  } 
        })
        const teacher = await  User.findByIdAndUpdate(req.user.userId,{ 
            $push: { classes: savedClass._id  } 
        })

        

        res.status(200).json(savedClass)
    }catch(err){
        res.status(500).json(err)
    }
})


router.get("/getClasses/:groupId",verifyToken,roleMiddleware("teacher"),async(req,res)=>{
    try{
        const classes = await Class.find({group: req.params.groupId})
        res.status(200).json(classes);
    }catch(err){
        res.status(500).json(err)
    }
})

router.post("/:classId/assign",verifyToken,roleMiddleware("teacher"),async(req,res)=>{
    try{
        

        const updatedClass = await Class.findByIdAndUpdate(req.params.classId,
            {$addToSet : {students:req.body.studentId}},
            {new:true}
        );
        res.status(200).json();
    }catch(err){
        res.status(500).json(err)
    }
})


module.exports = router;
