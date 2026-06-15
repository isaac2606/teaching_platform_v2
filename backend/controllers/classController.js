const User = require("../models/User");
const Group = require("../models/Group");
const Class = require("../models/Class");

const createClass = async (req, res) => {
    try {
        // Verify the group exists before trying to add a class to it
        const groupExists = await Group.findById(req.body.groupId);
        if (!groupExists) {
            return res.status(404).json({ message: "Group not found" });
        }

        const imagePath = req.file ? req.file.filename : "";

        const newClass = new Class({
            title: req.body.title,
            teacher: req.user.userId,
            group: req.body.groupId,
            date: req.body.date || "",
            imageUrl: imagePath
        });

        const savedClass = await newClass.save();

        await Group.findByIdAndUpdate(req.body.groupId, { 
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

const getClassesByGroup = async (req, res) => {
    try {
        // Optional: Check if group exists
        const groupExists = await Group.findById(req.params.groupId);
        if (!groupExists) {
            return res.status(404).json({ message: "Group not found" });
        }

        const classes = await Class.find({ group: req.params.groupId });
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

module.exports = {
    createClass,
    getClassesByGroup,
    assignStudent
};
