const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const authorize = require("../middleware/roleMiddleware");
const {
  createHub,
  leaveHub,
  getAllHubs,
  getMyHubs,
  getHubById,
  getHubByInviteToken,
  updateHub,
  deleteHub,
  getDashboardStats,
  fixIndex
} = require("../controllers/hubController");

// create a hub
router.post("/", verifyToken, authorize("teacher"), createHub);

// leave a hub
router.put("/:id/leave", verifyToken, authorize("student"), leaveHub);

// get ALL hubs
router.get("/getHubs", verifyToken, getAllHubs);

// fix index
router.get("/fix-index", fixIndex);

// get dashboard stats
router.get("/stats", verifyToken, authorize("teacher"), getDashboardStats);

// get my hubs (handles both student and teacher logic)
router.get("/my-hubs", verifyToken, getMyHubs);

// get hubs based on invite link (Changed to /invite/:inviteToken so it doesn't conflict with /:id)
router.get("/invite/:inviteToken", verifyToken, getHubByInviteToken);

// get specific hub
router.get("/:id", verifyToken, getHubById);

// edit hub
router.put("/:id", verifyToken, authorize("teacher"), updateHub);

// delete hub
router.delete("/:id", verifyToken, authorize("teacher"), deleteHub);

module.exports = router;
