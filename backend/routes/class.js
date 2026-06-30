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
  editClass,
  deleteClass,
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

// edit a class (title only for now)
router.put(
  "/editClass/:classId",
  verifyToken,
  roleMiddleware("teacher"),
  editClass
);

// delete a class
router.delete(
  "/deleteClass/:classId",
  verifyToken,
  roleMiddleware("teacher"),
  deleteClass
);

module.exports = router;
