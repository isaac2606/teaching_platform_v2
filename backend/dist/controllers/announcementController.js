"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHubFeed = exports.getAllAnnouncements = exports.addAnnouncement = void 0;
const Announcement_1 = __importDefault(require("../models/Announcement"));
const Hub_1 = __importDefault(require("../models/Hub"));
const addAnnouncement = async (req, res) => {
    try {
        const hubIds = Array.isArray(req.body.hubIds) ? req.body.hubIds : [req.body.hubIds];
        const imagePath = req.file ? req.file.filename : "";
        const announcement = new Announcement_1.default({
            title: req.body.title,
            description: req.body.description,
            teacher: req.user.userId,
            imageUrl: imagePath,
            hubs: hubIds
        });
        const savedAnnouncement = await announcement.save();
        await Hub_1.default.updateMany({ _id: { $in: hubIds } }, { $push: { announcements: savedAnnouncement._id } });
        res.status(200).json({
            message: "announcement added succesfully",
            announcement: savedAnnouncement
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
exports.addAnnouncement = addAnnouncement;
const getAllAnnouncements = async (req, res) => {
    try {
        const anounc = await Announcement_1.default.find({});
        res.status(200).json(anounc);
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
exports.getAllAnnouncements = getAllAnnouncements;
const getHubFeed = async (req, res) => {
    try {
        const params = {};
        if (req.params.hubId) {
            params.hubId = req.params.hubId;
        }
        const feed = await Announcement_1.default.find({ hubs: params.hubId })
            .populate("teacher", "email");
        const hub = await Hub_1.default.findById(req.params.hubId);
        if (!hub) {
            return res.status(404).json({ message: "Hub not found" });
        }
        res.status(200).json(feed);
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
exports.getHubFeed = getHubFeed;
//# sourceMappingURL=announcementController.js.map