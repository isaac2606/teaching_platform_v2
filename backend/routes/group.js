const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const authorize = require("../middleware/roleMiddleware");
const {
  createGroup,
  joinGroup,
  leaveGroup,
  getAllGroups,
  getMyGroups,
  getGroupById,
  getGroupByInviteToken,
  updateGroup,
  deleteGroup
} = require("../controllers/groupController");

// create a group
router.post("/", verifyToken, authorize("teacher"), createGroup);

// join a group
router.post("/join/:inviteToken", verifyToken, authorize("student"), joinGroup);

// leave a group
router.put("/:id/leave", verifyToken, authorize("student"), leaveGroup);

// get ALL groups
router.get("/getGroups", verifyToken, getAllGroups);

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
