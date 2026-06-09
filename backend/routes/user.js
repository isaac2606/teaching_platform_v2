const express = require("express");
const User = require("../models/User");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken")
const authorize=require("../middleware/roleMiddleware");
const { findById } = require("../models/User");

router.get("/teacher",  verifyToken,authorize("teacher"), async (req,res)=> {
    res.json({
        message:"this is teacher side"
    })
})


router.get("/student", verifyToken , authorize("student"), async (req,res)=> {

    res.json({
        message:"this is student side"
    })
})

router.get("/getUsers",verifyToken,async(req,res)=>{
    try{

        const users =  await User.find({});

        res.status(200).json(users)


    }catch(err){
        res.status(500).json(err)
    }
})

//idea:show profile like upwork but for teachers
router.get("/:id",async (req,res)=>{
    try{

        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const {password,updatedAt,...other} = user._doc;
        res.status(200).json(other)
    
    }catch(err){
        res.status(500).json(err)
    }
});


module.exports = router;