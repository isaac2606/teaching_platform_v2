const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

const {
  createClass,
  getClassesByHub,
  assignStudent,
  joinClass,
} = require("../controllers/classController");

// create a class
router.post(
  "/createClass",
  verifyToken,
  roleMiddleware("teacher"),
  upload.single("imageUrl"),
  createClass,
);

// get classes for a specific hub
router.get(
  "/getClasses/:hubId",
  verifyToken,
  roleMiddleware("teacher"),
  getClassesByHub,
);

// assign student to a class
router.post(
  "/:classId/assign",
  verifyToken,
  roleMiddleware("teacher"),
  assignStudent,
);

// join a class via invite link
router.post(
  "/join/:inviteToken",
  verifyToken,
  roleMiddleware("student"),
  joinClass,
);

module.exports = router;
