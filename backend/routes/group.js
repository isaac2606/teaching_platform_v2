const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const authorize = require("../middleware/roleMiddleware");
const {
  createGroup,
  leaveGroup,
  getAllGroups,
  getMyGroups,
  getGroupById,
  getGroupByInviteToken,
  updateGroup,
  deleteGroup,
  getDashboardStats,
  fixIndex
} = require("../controllers/groupController");

// create a group
router.post("/", verifyToken, authorize("teacher"), createGroup);

// route removed

// leave a group
router.put("/:id/leave", verifyToken, authorize("student"), leaveGroup);

// get ALL groups
router.get("/getGroups", verifyToken, getAllGroups);

// fix index
router.get("/fix-index", fixIndex);

// get dashboard stats
router.get("/stats", verifyToken, authorize("teacher"), getDashboardStats);

// get my groups (handles both student and teacher logic)
router.get("/my-groups", verifyToken, getMyGroups);

// get groups based on invite link (Changed to /invite/:inviteToken so it doesn't conflict with /:id)
router.get("/invite/:inviteToken", verifyToken, getGroupByInviteToken);

// get specific group
router.get("/:id", verifyToken, getGroupById);

// edit group
router.put("/:id", verifyToken, authorize("teacher"), updateGroup);

// delete group
router.delete("/:id", verifyToken, authorize("teacher"), deleteGroup);

module.exports = router;
