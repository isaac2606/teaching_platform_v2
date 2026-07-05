import { Request, Response } from "express";
import Announcement from "../models/Announcement";
import Hub from "../models/Hub";

const addAnnouncement = async (req: Request, res: Response) => {
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
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
};

const getAllAnnouncements = async (req: Request, res: Response) => {
    try {
        const anounc = await Announcement.find({});
        res.status(200).json(anounc);
    } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
};

const getHubFeed = async (req: Request, res: Response) => {
    try {
        const params :any = {};
        if(req.params.hubId){
            params.hubId = req.params.hubId;
        }
        const feed = await Announcement.find({ hubs : params.hubId})
            .populate("teacher", "email");
            
        const hub = await Hub.findById(req.params.hubId);
        if (!hub) {
            return res.status(404).json({ message: "Hub not found" });
        }
        
        res.status(200).json(feed);
    } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
};

export {
    addAnnouncement,
    getAllAnnouncements,
    getHubFeed
};
