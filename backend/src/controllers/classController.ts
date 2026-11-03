import { Request, Response } from "express";
import User from "../models/User";
import Hub from "../models/Hub";
import Class from "../models/Class";
import crypto from "crypto";
import { assignStudentToClass, joinClassByInviteToken } from "../services/membershipService";
import { cascadeDeleteClass } from "../services/cascadeDeleteService";

const createClass = async (req: Request, res: Response) => {
    try {
        const hubExists = await Hub.findById(req.body.hubId);
        if (!hubExists) {
            return res.status(404).json({ message: "Hub not found" });
        }

        // Schedule Conflict Check
        const conflictingClass = await Class.findOne({ 
             teacher: req.user.userId, 
             date: req.body.date
        });

        if (conflictingClass) {
             return res.status(400).json({ 
                 message: "Schedule conflict: You already have a group scheduled at this time!" 
             });
        }

        const imagePath = req.file ? req.file.path : "";
        const inviteToken = crypto.randomBytes(8).toString("hex");

        const newClass = new Class({
            title: req.body.title,
            teacher: req.user.userId,
            hub: req.body.hubId,
            date: req.body.date || "",
            imageUrl: imagePath,
            inviteToken: inviteToken,
            dues: req.body.dues || 0,
            duration: req.body.duration || "1h 00m",
            type: req.body.type || "Live Video"
        });

        const savedClass = await newClass.save();

        try {
            await Hub.findByIdAndUpdate(req.body.hubId, { 
                $push: { classes: savedClass._id } 
            });
            
            await User.findByIdAndUpdate(req.user.userId, { 
                $addToSet: { classes: savedClass._id } 
            });
        } catch (linkError) {
            await Class.findByIdAndDelete(savedClass._id);
            throw linkError;
        }

        res.status(201).json(savedClass);
    } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
};

const getClassesByHub = async (req: Request, res: Response) => {
    try {
        const hubExists = await Hub.findById(req.params.hubId);
        if (!hubExists) {
            return res.status(404).json({ message: "Hub not found" });
        }

        const classes = await Class.find({ hub: req.params.hubId });
        res.status(200).json(classes);
    } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
};

const assignStudent = async (req: Request, res: Response) => {
    try {
        const studentId = req.body.studentId as string;
        const classId = req.params.classId as string;

        if (!studentId || !classId) {
            return res.status(400).json({ message: "Student ID and Class ID are required" });
        }

        // First verify the student actually exists
        const student = await User.findById(studentId);
        if (!student || student.role !== "student") {
            return res.status(404).json({ message: "Student not found. Please check the ID." });
        }

        // Verify the class exists and check if student is already in it
        const targetClass = await Class.findById(classId);
        if (!targetClass) {
            return res.status(404).json({ message: "Class not found" });
        }

        if (targetClass.students.some(s => s.toString() === studentId)) {
            return res.status(400).json({ message: "Student is already enrolled in this group." });
        }

        const updatedClass = await assignStudentToClass(studentId, classId);

        res.status(200).json({ message: "Student assigned successfully", class: updatedClass });
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json("An unknown error occurred");
        }
    }
};

const joinClass = async (req: Request, res: Response) => {
    try {
        const inviteToken = req.params.inviteToken as string;
        if (!inviteToken) {
            return res.status(400).json({ message: "Invite token is required" });
        }

        const result = await joinClassByInviteToken(req.user.userId, inviteToken);
        
        if (!result) {
            return res.status(404).json({ message: "Class not found or invalid invite token." });
        }
        
        if (result.alreadyJoined) {
            return res.status(200).json({ message: "Student already in the class" });
        }

        res.status(200).json({ message: "Student joined the class successfully" });
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json("An unknown error occurred");
        }
    }
};

const editClass = async (req: Request, res: Response) => {
    const conflictingClass = await Class.findOne({ 
             _id: { $ne: req.params.classId },
             teacher: req.user.userId, 
             date: req.body.date
        });

    if (conflictingClass) {
        return res.status(400).json({ 
            message: "Schedule conflict: You already have a group scheduled at this time!" 
        });
    }
    try {
        const updatedClass = await Class.findOneAndUpdate(
            { _id: req.params.classId, teacher: req.user.userId },
            { $set: { 
                title: req.body.title,
                date: req.body.date || "",
                duration: req.body.duration || "1h 00m",
                type: req.body.type || "Live Video"
            } },
            { new: true }
        );

        if (!updatedClass) {
            return res.status(404).json({ message: "Class not found or unauthorized" });
        }

        res.status(200).json(updatedClass);
    } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
};

const deleteClass = async (req: Request, res: Response) => {
    try {
        const classId = req.params.classId as string;
        if (!classId) {
            return res.status(400).json({ message: "Class ID required" });
        }

        const deletedClass = await cascadeDeleteClass(classId, req.user.userId);
        
        if (!deletedClass) {
            return res.status(404).json({ message: "Class not found or unauthorized" });
        }

        res.status(200).json({ message: "Class deleted successfully" });
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json("An unknown error occurred");
        }
    }
};

const recordAttendance = async (req: Request, res: Response) => {
    try {
        const { classId } = req.params;
        const { records } = req.body;
        
        const Attendance = require('../models/Attendance').default;
        
        for (const [studentId, status] of Object.entries(records)) {
            // Capitalize status to match model enum 'Present' or 'Absent'
            const formattedStatus = (status as string).charAt(0).toUpperCase() + (status as string).slice(1);
            
            await Attendance.findOneAndUpdate(
                { student: studentId, classCohort: classId, date: { $gte: new Date().setHours(0,0,0,0) } },
                { 
                    student: studentId, 
                    classCohort: classId, 
                    status: formattedStatus,
                    date: new Date()
                },
                { upsert: true, new: true }
            );
        }
        
        res.status(200).json({ message: 'Attendance recorded successfully' });
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json('An unknown error occurred');
        }
    }
};

export {
    createClass,
    getClassesByHub,
    assignStudent,
    joinClass,
    editClass,
    deleteClass,
    recordAttendance
};
