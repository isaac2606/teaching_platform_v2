const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/upload");
const {
  addAnnouncement,
  getAllAnnouncements,
  getHubFeed
} = require("../controllers/announcementController");

// create an announcement
router.post("/add", verifyToken, upload.single("image"), addAnnouncement);

// get all announcements
router.get("/getAnounc", verifyToken, getAllAnnouncements);

// get hub feed
router.get("/hub/:hubId", verifyToken, getHubFeed);

module.exports = router;