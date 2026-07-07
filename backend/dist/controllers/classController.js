"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClass = exports.editClass = exports.joinClass = exports.assignStudent = exports.getClassesByHub = exports.createClass = void 0;
const User_1 = __importDefault(require("../models/User"));
const Hub_1 = __importDefault(require("../models/Hub"));
const Class_1 = __importDefault(require("../models/Class"));
const crypto_1 = __importDefault(require("crypto"));
const createClass = async (req, res) => {
    try {
        const hubExists = await Hub_1.default.findById(req.body.hubId);
        if (!hubExists) {
            return res.status(404).json({ message: "Hub not found" });
        }
        // Schedule Conflict Check
        const conflictingClass = await Class_1.default.findOne({
            teacher: req.user.userId,
            date: req.body.date
        });
        if (conflictingClass) {
            return res.status(400).json({
                message: "Schedule conflict: You already have a group scheduled at this time!"
            });
        }
        const imagePath = req.file ? req.file.filename : "";
        const inviteToken = crypto_1.default.randomBytes(8).toString("hex");
        const newClass = new Class_1.default({
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
        await Hub_1.default.findByIdAndUpdate(req.body.hubId, {
            $push: { classes: savedClass._id }
        });
        await User_1.default.findByIdAndUpdate(req.user.userId, {
            $push: { classes: savedClass._id }
        });
        res.status(201).json(savedClass);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json("An unknown error occurred");
        }
    }
};
exports.createClass = createClass;
const getClassesByHub = async (req, res) => {
    try {
        const hubExists = await Hub_1.default.findById(req.params.hubId);
        if (!hubExists) {
            return res.status(404).json({ message: "Hub not found" });
        }
        const classes = await Class_1.default.find({ hub: req.params.hubId });
        res.status(200).json(classes);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json("An unknown error occurred");
        }
    }
};
exports.getClassesByHub = getClassesByHub;
const assignStudent = async (req, res) => {
    try {
        // First verify the student actually exists
        const student = await User_1.default.findById(req.body.studentId);
        if (!student || student.role !== "student") {
            return res.status(404).json({ message: "Student not found. Please check the ID." });
        }
        // Verify the class exists and check if student is already in it
        const targetClass = await Class_1.default.findById(req.params.classId);
        if (!targetClass) {
            return res.status(404).json({ message: "Class not found" });
        }
        if (targetClass.students.includes(req.body.studentId)) {
            return res.status(400).json({ message: "Student is already enrolled in this group." });
        }
        const updatedClass = await Class_1.default.findByIdAndUpdate(req.params.classId, { $addToSet: { students: req.body.studentId } }, { new: true });
        if (!updatedClass) {
            return res.status(404).json({ message: "Class not found" });
        }
        // Add student to the parent Hub
        await Hub_1.default.updateOne({ _id: updatedClass.hub }, { $addToSet: { students: req.body.studentId } });
        // Add Hub and Class to Student's User document
        await User_1.default.updateOne({ _id: req.body.studentId }, {
            $addToSet: { hubs: updatedClass.hub._id },
            $push: { classes: updatedClass._id }
        });
        res.status(200).json({ message: "Student assigned successfully", class: updatedClass });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json("An unknown error occurred");
        }
    }
};
exports.assignStudent = assignStudent;
const joinClass = async (req, res) => {
    try {
        const classObj = await Class_1.default.findOne({ inviteToken: req.params.inviteToken });
        if (!classObj) {
            return res.status(404).json({ message: "Class not found or invalid invite token." });
        }
        if (!classObj.students.includes(req.user.userId)) {
            // Add student to the Cohort
            await classObj.updateOne({ $push: { students: req.user.userId } });
            // Add student to the Hub if not already there
            await Hub_1.default.updateOne({ _id: classObj.hub }, { $addToSet: { students: req.user.userId } });
            // Add Hub and Class to User's list
            await User_1.default.updateOne({ _id: req.user.userId }, {
                $addToSet: { hubs: classObj.hub },
                $push: { classes: classObj._id }
            });
            res.status(200).json({ message: "Student joined the class successfully" });
        }
        else {
            res.status(200).json({ message: "Student already in the class" });
        }
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json("An unknown error occurred");
        }
    }
};
exports.joinClass = joinClass;
const editClass = async (req, res) => {
    const conflictingClass = await Class_1.default.findOne({
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
        const updatedClass = await Class_1.default.findOneAndUpdate({ _id: req.params.classId, teacher: req.user.userId }, { $set: {
                title: req.body.title,
                date: req.body.date || "",
                duration: req.body.duration || "1h 00m",
                type: req.body.type || "Live Video"
            } }, { new: true });
        if (!updatedClass) {
            return res.status(404).json({ message: "Class not found or unauthorized" });
        }
        res.status(200).json(updatedClass);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json("An unknown error occurred");
        }
    }
};
exports.editClass = editClass;
const deleteClass = async (req, res) => {
    try {
        const classObj = await Class_1.default.findOne({ _id: req.params.classId, teacher: req.user.userId });
        if (!classObj) {
            return res.status(404).json({ message: "Class not found or unauthorized" });
        }
        // Remove from Hub's classes array
        await Hub_1.default.findByIdAndUpdate(classObj.hub, {
            $pull: { classes: classObj._id }
        });
        // Remove from Teacher's classes array
        await User_1.default.findByIdAndUpdate(req.user.userId, {
            $pull: { classes: classObj._id }
        });
        await Class_1.default.findByIdAndDelete(req.params.classId);
        res.status(200).json({ message: "Class deleted successfully" });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json("An unknown error occurred");
        }
    }
};
exports.deleteClass = deleteClass;
//# sourceMappingURL=classController.js.map