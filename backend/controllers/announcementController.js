const Announcement = require("../models/Announcement");
const Hub = require("../models/Hub");

const addAnnouncement = async (req, res) => {
    try {
        const hubIds = Array.isArray(req.body.hubIds) ? req.body.hubIds : [req.body.hubIds];
        const imagePath = req.file ? req.file.filename : "";

        const announcement = new Announcement({
            title: req.body.title,
            description: req.body.description,
            teacher: req.user.userId,
            imageUrl: imagePath,
            hubs: hubIds
        });

        const savedAnnouncement = await announcement.save();
        
        await Hub.updateMany(
            { _id: { $in: hubIds } },
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

const getHubFeed = async (req, res) => {
    try {
        const feed = await Announcement.find({ hubs: req.params.hubId })
            .populate("teacher", "email");
            
        const hub = await Hub.findById(req.params.hubId);
        if (!hub) {
            return res.status(404).json({ message: "Hub not found" });
        }
        
        res.status(200).json(feed);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    addAnnouncement,
    getAllAnnouncements,
    getHubFeed
};
