"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kickStudent = exports.getStudents = exports.joinHubByInviteToken = exports.getChatHistory = exports.fixIndex = exports.getDashboardStats = exports.deleteHub = exports.updateHub = exports.getHubByInviteToken = exports.getHubById = exports.getMyHubs = exports.getAllHubs = exports.leaveHub = exports.createHub = void 0;
const Hub_1 = __importDefault(require("../models/Hub"));
const User_1 = __importDefault(require("../models/User"));
const Class_1 = __importDefault(require("../models/Class"));
const crypto_1 = __importDefault(require("crypto"));
const createHub = async (req, res) => {
    try {
        const inviteToken = crypto_1.default.randomBytes(8).toString("hex");
        const hub = new Hub_1.default({
            title: req.body.title,
            teacher: req.user.userId,
            inviteToken: inviteToken
        });
        const savedHub = await hub.save();
        await User_1.default.findByIdAndUpdate({ _id: req.user.userId }, { $push: { hubs: savedHub._id } });
        res.status(201).json(savedHub);
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
exports.createHub = createHub;
const leaveHub = async (req, res) => {
    try {
        const hub = await Hub_1.default.findById(req.params.id);
        if (!hub) {
            return res.status(404).json({ message: "Hub not found" });
        }
        if (hub.students.includes(req.user.userId)) {
            await hub.updateOne({ $pull: { students: req.user.userId } });
            const classesInHub = await Class_1.default.find({ hub: hub._id });
            const classIds = classesInHub.map(c => c._id);
            await Class_1.default.updateMany({ hub: hub._id }, { $pull: { students: req.user.userId } });
            await User_1.default.updateOne({ _id: req.user.userId }, {
                $pull: { hubs: hub._id },
                $pullAll: { classes: classIds }
            });
            res.status(200).json({ message: "Student left the hub and its groups" });
        }
        else {
            res.status(200).json({ message: "Student was not in the hub" });
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
exports.leaveHub = leaveHub;
const kickStudent = async (req, res) => {
    try {
        const hub = await Hub_1.default.findById(req.params.id);
        if (!hub) {
            return res.status(404).json({ message: "Hub not found" });
        }
        if (hub.teacher.toString() !== req.user.userId) {
            return res.status(403).json({ message: "You do not have permission to modify this hub's roster." });
        }
        if (hub.students.includes(req.params.studentId)) {
            await hub.updateOne({ $pull: { students: req.params.studentId } });
            const classesInHub = await Class_1.default.find({ hub: hub._id });
            const classIds = classesInHub.map(c => c._id);
            await Class_1.default.updateMany({ hub: hub._id }, { $pull: { students: req.params.studentId } });
            await User_1.default.updateOne({ _id: req.params.studentId }, {
                $pull: { hubs: hub._id },
                $pullAll: { classes: classIds }
            });
            res.status(200).json({ message: "Student kicked from the hub and all its groups" });
        }
        else {
            res.status(200).json({ message: "Student was not in the hub" });
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
exports.kickStudent = kickStudent;
const getAllHubs = async (req, res) => {
    try {
        const hubs = await Hub_1.default.find({});
        res.status(200).json(hubs);
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
exports.getAllHubs = getAllHubs;
const getMyHubs = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        if (role === "teacher") {
            const user = await User_1.default.findById(userId).populate('hubs');
            if (!user)
                return res.status(404).json({ message: "User not found" });
            return res.status(200).json(user.hubs);
        }
        else if (role === "student") {
            const hubs = await Hub_1.default.find({ students: userId });
            return res.status(200).json(hubs);
        }
        else {
            return res.status(403).json({ message: "Unauthorized role" });
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
exports.getMyHubs = getMyHubs;
const getHubById = async (req, res) => {
    try {
        const hub = await Hub_1.default.findById(req.params.id)
            .populate('teacher', 'username email')
            .populate('students', 'username email');
        if (!hub) {
            return res.status(404).json({ message: "Hub not found" });
        }
        res.status(200).json(hub);
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
exports.getHubById = getHubById;
const getHubByInviteToken = async (req, res) => {
    try {
        const hub = await Hub_1.default.findOne({ inviteToken: req.params.inviteToken });
        if (!hub) {
            return res.status(404).json({ message: "Hub not found" });
        }
        res.status(200).json(hub);
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
exports.getHubByInviteToken = getHubByInviteToken;
const joinHubByInviteToken = async (req, res) => {
    try {
        const hub = await Hub_1.default.findOne({ inviteToken: req.params.inviteToken });
        const group = await Class_1.default.findOne({ inviteToken: req.params.inviteToken });
        if (!hub && group) {
            if (!group.students.includes(req.user.userId)) {
                // Add student to the Cohort
                await group.updateOne({ $push: { students: req.user.userId } });
                // Add Hub to User's list
                await User_1.default.updateOne({ _id: req.user.userId }, {
                    $addToSet: { hubs: group.hub._id },
                    $push: { classes: group._id }
                });
                res.status(200).json({ message: "Student joined the Class successfully" });
            }
            else {
                res.status(200).json({ message: "Student already in the Class" });
            }
        }
        else if (!hub) {
            return res.status(404).json({ message: "Hub not found or invalid invite token." });
        }
        else {
            if (!hub.students.includes(req.user.userId)) {
                // Add student to the Cohort
                await hub.updateOne({ $push: { students: req.user.userId } });
                // Add Hub to User's list
                await User_1.default.updateOne({ _id: req.user.userId }, {
                    $addToSet: { hubs: hub._id },
                });
                res.status(200).json({ message: "Student joined the Hub successfully" });
            }
            else {
                res.status(200).json({ message: "Student already in the Hub" });
            }
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
exports.joinHubByInviteToken = joinHubByInviteToken;
const updateHub = async (req, res) => {
    try {
        const updatedHub = await Hub_1.default.findByIdAndUpdate(req.params.id, { $set: { title: req.body.title } }, { new: true });
        if (!updatedHub) {
            return res.status(404).json({ message: "Hub not found" });
        }
        res.status(200).json(updatedHub);
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
exports.updateHub = updateHub;
const deleteHub = async (req, res) => {
    try {
        const hub = await Hub_1.default.findByIdAndDelete(req.params.id);
        if (!hub) {
            return res.status(404).json({ message: "Hub not found" });
        }
        await User_1.default.updateMany({ hubs: req.params.id }, { $pull: { hubs: req.params.id } });
        res.status(200).json({ message: "Hub has been deleted" });
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
exports.deleteHub = deleteHub;
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const hubs = await Hub_1.default.find({ teacher: userId }).populate('classes');
        let allStudentIds = new Set();
        let outstandingDues = 0;
        let sessionsToday = 0;
        const today = new Date().toISOString().split('T')[0];
        hubs.forEach(hub => {
            hub.students.forEach(studentId => allStudentIds.add(studentId.toString()));
            hub.classes.forEach(c => {
                outstandingDues += (c.dues || 0) * (c.students?.length || 0);
                if (c.date && c.date.startsWith(today)) {
                    sessionsToday++;
                }
            });
        });
        res.status(200).json({
            totalStudents: allStudentIds.size,
            activeHubs: hubs.length,
            outstandingDues,
            sessionsToday
        });
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
exports.getDashboardStats = getDashboardStats;
const fixIndex = async (req, res) => {
    try {
        const result = await Hub_1.default.collection.dropIndex('inviteToken_1');
        res.status(200).json({ message: "Index dropped successfully", result });
    }
    catch (err) {
        if (err.code === 27) {
            return res.status(200).json({ message: "Index already dropped or doesn't exist" });
        }
        res.status(500).json({ error: err.message });
    }
};
exports.fixIndex = fixIndex;
const getChatHistory = async (req, res) => {
    try {
        const chatHistory = await Hub_1.default.findById(req.params.hubId).populate("sender", "username").sort({ createdAt: 1 });
        res.status(200).json(chatHistory);
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
exports.getChatHistory = getChatHistory;
const getStudents = async (req, res) => {
    try {
        const hub = await Hub_1.default.findById(req.params.hubId).populate("students");
        res.status(200).json(hub.students);
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
exports.getStudents = getStudents;
//# sourceMappingURL=hubController.js.map