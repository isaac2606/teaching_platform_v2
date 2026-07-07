"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTeachers = exports.getAllStudents = exports.getContact = exports.addNewContact = exports.getUserProfile = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.default.find({});
        res.status(200).json(users);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: "Error fetching users", error: err.message });
        }
        else {
            res.status(500).json("An unknown error occurred");
        }
    }
};
exports.getAllUsers = getAllUsers;
const getUserProfile = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const { password, updatedAt, ...other } = user.toObject();
        res.status(200).json(other);
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
exports.getUserProfile = getUserProfile;
const getContact = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.userId).populate("recentUsers");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user.recentUsers || []);
    }
    catch (err) {
        console.error("GET CONTACT ERROR:", err);
        if (err instanceof Error) {
            res.status(500).json({ message: err.message, stack: err.stack });
        }
        else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
    }
};
exports.getContact = getContact;
const addNewContact = async (req, res) => {
    try {
        const newContact = await User_1.default.findById(req.body.newContact);
        if (!newContact) {
            return res.status(404).json({ message: "That contact does not exist!" });
        }
        if (req.user.role === "student" && newContact.role === "student")
            res.status(403).json({ message: "cannot contact student privatly" });
        else {
            const updatedUser = await User_1.default.findByIdAndUpdate(req.user.userId, { $addToSet: { recentUsers: newContact._id } }, { new: true } // Return updated doc
            );
            if (!updatedUser) {
                return res.status(403).json({ message: "Failed to update user" });
            }
            else {
                res.status(200).json({ message: "Contact added", recentUsers: updatedUser.recentUsers });
            }
        }
    }
    catch (err) {
        console.error("Error in addNewContact:", err);
        res.status(500).json(err);
    }
};
exports.addNewContact = addNewContact;
const getAllStudents = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.userId).populate("students");
        if (!user) {
            return res.status(404).json({ message: "That contact does not exist!" });
        }
        res.status(200).json(user.students);
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
exports.getAllStudents = getAllStudents;
const getAllTeachers = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.userId).populate("teachers");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user.teachers);
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
exports.getAllTeachers = getAllTeachers;
//# sourceMappingURL=userController.js.map