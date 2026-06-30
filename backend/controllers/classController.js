const User = require("../models/User");
const Hub = require("../models/Hub");
const Class = require("../models/Class");
const crypto = require("crypto");

const createClass = async (req, res) => {
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

        const imagePath = req.file ? req.file.filename : "";
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

        await Hub.findByIdAndUpdate(req.body.hubId, { 
            $push: { classes: savedClass._id } 
        });
        
        await User.findByIdAndUpdate(req.user.userId, { 
            $push: { classes: savedClass._id } 
        });

        res.status(201).json(savedClass);
    } catch (err) {
        res.status(500).json({ message: "Error creating class", error: err.message });
    }
};

const getClassesByHub = async (req, res) => {
    try {
        const hubExists = await Hub.findById(req.params.hubId);
        if (!hubExists) {
            return res.status(404).json({ message: "Hub not found" });
        }

        const classes = await Class.find({ hub: req.params.hubId });
        res.status(200).json(classes);
    } catch (err) {
        res.status(500).json({ message: "Error fetching classes", error: err.message });
    }
};

const assignStudent = async (req, res) => {
    try {
        const updatedClass = await Class.findByIdAndUpdate(
            req.params.classId,
            { $addToSet: { students: req.body.studentId } },
            { new: true }
        );

        if (!updatedClass) {
            return res.status(404).json({ message: "Class not found" });
        }

        res.status(200).json({ message: "Student assigned successfully", class: updatedClass });
    } catch (err) {
        res.status(500).json({ message: "Error assigning student", error: err.message });
    }
};

const joinClass = async (req, res) => {
    try {
        const classObj = await Class.findOne({ inviteToken: req.params.inviteToken });
        
        if (!classObj) {
            
            return res.status(404).json({ message: "Class not found or invalid invite token." });
        }
        
        if (!classObj.students.includes(req.user.userId)) {
            // Add student to the Cohort
            await classObj.updateOne({ $push: { students: req.user.userId } });
            
            // Add student to the Hub if not already there
            await Hub.updateOne(
                { _id: classObj.hub },
                { $addToSet: { students: req.user.userId } }
            );

            // Add Hub and Class to User's list
            await User.updateOne(
                { _id: req.user.userId },
                { 
                    $addToSet: { hubs: classObj.hub },
                    $push: { classes: classObj._id }
                }
            );

            res.status(200).json({ message: "Student joined the class successfully" });
        } else {
            res.status(200).json({ message: "Student already in the class" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const editClass = async (req, res) => {
    try {
        const updatedClass = await Class.findOneAndUpdate(
            { _id: req.params.classId, teacher: req.user.userId },
            { $set: { title: req.body.title } },
            { new: true }
        );

        if (!updatedClass) {
            return res.status(404).json({ message: "Class not found or unauthorized" });
        }

        res.status(200).json(updatedClass);
    } catch (err) {
        res.status(500).json({ message: "Error editing class", error: err.message });
    }
};

const deleteClass = async (req, res) => {
    try {
        const classObj = await Class.findOne({ _id: req.params.classId, teacher: req.user.userId });
        
        if (!classObj) {
            return res.status(404).json({ message: "Class not found or unauthorized" });
        }

        // Remove from Hub's classes array
        await Hub.findByIdAndUpdate(classObj.hub, {
            $pull: { classes: classObj._id }
        });

        // Remove from Teacher's classes array
        await User.findByIdAndUpdate(req.user.userId, {
            $pull: { classes: classObj._id }
        });

        await Class.findByIdAndDelete(req.params.classId);

        res.status(200).json({ message: "Class deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting class", error: err.message });
    }
};

module.exports = {
    createClass,
    getClassesByHub,
    assignStudent,
    joinClass,
    editClass,
    deleteClass
};
