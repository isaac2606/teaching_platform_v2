import { Request, Response } from "express";
import express from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/verifyToken";
interface DecodedToken {
  userId: string;
  role?: string;
}

const JWT_SECRET = process.env.JWT_SECRET!
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET! || "your-refresh-secret-key-change-this"

const logout= async (req: Request, res: Response)=>{
    try{
    const userId = req.user.userId;

    await User.findByIdAndUpdate(userId,{refreshToken:null});

    res.status(200).json({message:"logged out succesfully"})
    }catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
}

const login = async (req: Request, res: Response)=>{
    try{
        
        const user = await User.findOne({
            email:req.body.email
        })
        if(!user){
            return res.status(404).json("user not found");
        }
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password!
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
            JWT_SECRET!,
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
        
        const {password,...userWithoutPassword} = user;

        res.status(200).json({
            message:"loggin succesful",
            accessToken:accessToken,
            refreshToken:refreshToken,
            user:userWithoutPassword,
            
        })
    }catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
}


const register = async (req: Request, res: Response)=> {
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
            JWT_SECRET!,
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
                _id:user._id,
                username:user.username,
                email:user.email,
                role:user.role
            }
        })
    }catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
}

const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ message: "Refresh token is missing" });

        jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err: any, payload: any) => {
            if (err) return res.status(403).json({ message: "Refresh token is invalid or expired" });
            if(!payload) return res.status(403).json({ message: "No payload" });
            const decodedPayload = payload as DecodedToken;
            const user = await User.findById(decodedPayload.userId );
            if (!user || user.refreshToken !== refreshToken) {
                return res.status(403).json({ message: "Invalid refresh token" });
            }

            const newAccessToken = jwt.sign(
                {
                    userId: user._id,
                    email: user.email,
                    username: user.username,
                    role: user.role
                },
                JWT_SECRET!,
                { expiresIn: "15d" }
            );

            const newRefreshToken = jwt.sign(
                { userId: user._id },
                REFRESH_TOKEN_SECRET
            );
            user.refreshToken = newRefreshToken;
            await user.save();

            res.status(200).json({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });
        });
    } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
};







export { register, logout, login, refresh };