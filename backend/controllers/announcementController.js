const Announcement = require("../models/Announcement");
const Group = require("../models/Group");

const addAnnouncement = async (req, res) => {
    try {
        // Ensure groupsIds is an array just in case a single string is sent
        const groupsIds = Array.isArray(req.body.groupsIds) ? req.body.groupsIds : [req.body.groupsIds];
        const imagePath = req.file ? req.file.filename : "";

        const announcement = new Announcement({
            title: req.body.title,
            description: req.body.description,
            teacher: req.user.userId,
            imageUrl: imagePath,
            groups: groupsIds
        });

        const savedAnnouncement = await announcement.save();
        
        // Update all associated groups efficiently in one query
        await Group.updateMany(
            { _id: { $in: groupsIds } },
            { $push: { announcements: savedAnnouncement._id } }
        );

        res.status(200).json({
            message: "announcement added succesfully",
            announcement: savedAnnouncement
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

const getAllAnnouncements = async (req, res) => {
    try {
        const anounc = await Announcement.find({});
        res.status(200).json(anounc);
    } catch (err) {
        res.status(500).json(err);
    }
};

const getGroupFeed = async (req, res) => {
    try {
        // Find all announcements where the groups array contains this groupId
        const feed = await Announcement.find({ groups: req.params.groupId })
            .populate("teacher", "email");
            
        // We could optionally check if the group exists first, but an empty feed is also valid.
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        
        res.status(200).json(feed);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    addAnnouncement,
    getAllAnnouncements,
    getGroupFeed
};
