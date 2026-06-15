const express = require("express")
const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const verifyToken = require("../middleware/verifyToken")
const JWT_SECRET = process.env.JWT_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key-change-this"

const logout= async (req,res)=>{
    try{
    const userId = req.user.userId;

    await User.findByIdAndUpdate(userId,{refreshToken:null});

    res.status(200).json({message:"logged out succesfully"})
    }catch(err){
        res.status(500).json(err)
    }
}

const login = async (req,res)=>{
    try{
        
        const user = await User.findOne({
            email:req.body.email
        })
        if(!user){
            return res.status(404).json("user not found");
        }
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if(!validPassword){
            return res.status(400).json("wrong password");
        }

        const accessToken = jwt.sign(
            {
                userId:user._id,
                email:user.email,
                username:user.username,
                role:user.role

            },
            JWT_SECRET,
            {expiresIn:"15d"},
        );
        const refreshToken = jwt.sign(

            {
                userId : user._id,

            },
            REFRESH_TOKEN_SECRET
        );
        user.refreshToken = refreshToken;
        await user.save();
        
        const {password,...userWithoutPassword} = user._doc;

        res.status(200).json({
            message:"loggin succesful",
            accessToken:accessToken,
            refreshToken:refreshToken,
            user:userWithoutPassword,
            
        })
    }catch(err){
        res.status(500).json(err)
    }
}


const register = async (req,res)=> {
    try{
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = new User({
            username:req.body.username,
            email:req.body.email,
            password:hashedPassword,
            role:req.body.role
        });

        await user.save();

        const accessToken = jwt.sign(
            {
                userId:user._id,
                email:user.email,
                username:user.username,
                role:user.role

            },
            JWT_SECRET,
            {expiresIn:"15d"},
        );


        const refreshToken = jwt.sign(

            {
                userId : user._id,

            },
            REFRESH_TOKEN_SECRET
        );

        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            message:"user registered succesfully",
            accessToken:accessToken,
            refreshToken:refreshToken,
            user:{
                id:user._id,
                username:user.username,
                email:user.email,
                role:user.role
            }
        })
    }catch(err){
        res.status(500).json(err)
    }
}

module.exports = { register, logout, login };