import express from "express";
const router = express.Router();

import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/requireHubRole";
import upload from "../middleware/upload";
import { addAnnouncement,
  getAllAnnouncements,
  getHubFeed,
 } from "../controllers/announcementController";

// create an announcement
router.post("/add", verifyToken, authorize("owner", "co_teacher"), upload.single("image"), addAnnouncement);

// get all announcements
router.get("/getAnounc", verifyToken, getAllAnnouncements);

// get hub feed
router.get("/hub/:hubId", verifyToken, authorize("owner", "co_teacher", "student"), getHubFeed);

export default router;
