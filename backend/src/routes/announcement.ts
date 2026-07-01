import express from "express";
const router = express.Router();

import verifyToken from "../middleware/verifyToken";
import upload from "../middleware/upload";
import { addAnnouncement,
  getAllAnnouncements,
  getHubFeed,
 } from "../controllers/announcementController";

// create an announcement
router.post("/add", verifyToken, upload.single("image"), addAnnouncement);

// get all announcements
router.get("/getAnounc", verifyToken, getAllAnnouncements);

// get hub feed
router.get("/hub/:hubId", verifyToken, getHubFeed);

export default router;
