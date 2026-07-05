import { Request, Response } from "express";
import User from "../models/User";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (err) {
        if(err instanceof Error){
            res.status(500).json({ message: "Error fetching users", error: err.message });
        }else{
            res.status(500).json("An unknown error occurred");
        }
        
    }
};

const getUserProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);
    } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
};

const getContact  = async (req: Request, res: Response)=>{

    try{
        
        const user = await User.findById(req.user.userId).populate("recentUsers");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.recentUsers || [])

    }catch(err){
        console.error("GET CONTACT ERROR:", err);
        if (err instanceof Error) {
            res.status(500).json({ message: err.message, stack: err.stack })
        } else {
            res.status(500).json({ message: "An unknown error occurred" })
        }
    }
}


const addNewContact  =async (req: Request, res: Response)=>{

    try{
        const newContact = await User.findById(req.body.newContact);
        if(req.user.role === "student" && newContact.role ==="student")
            res.status(403).json({message: "cannot contact student privatly"})
        else{
            const updatedUser = await User.findByIdAndUpdate(
                req.user.userId,
                { $addToSet: { recentUsers: newContact._id } },
                { new: true } // Return updated doc
            );
            res.status(200).json({message: "Contact added", recentUsers: updatedUser.recentUsers});
        }
        
    }catch(err){
        console.error("Error in addNewContact:", err);
        res.status(500).json(err)
    }
}

const getAllStudents = async (req: Request, res: Response)=>{
  try{
    const user = await User.findById(req.user.userId).populate("students");

    res.status(200).json(user.students)

  }catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
}

const getAllTeachers = async (req: Request, res: Response)=>{
  try{
    const user = await User.findById(req.user.userId).populate("teachers");

    res.status(200).json(user.teachers)

  }catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
}


export {
    getAllUsers,
    getUserProfile,
    addNewContact,
    getContact,
    getAllStudents,
    getAllTeachers
};
