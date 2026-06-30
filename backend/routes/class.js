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

router.post(
  "/createClass",
  verifyToken,
  roleMiddleware("teacher"),
  upload.single("imageUrl"),
  createClass,
);

router.get(
  "/getClasses/:hubId",
  verifyToken,
  roleMiddleware("teacher"),
  getClassesByHub,
);

router.post(
  "/:classId/assign",
  verifyToken,
  roleMiddleware("teacher"),
  assignStudent,
);

router.post(
  "/join/:inviteToken",
  verifyToken,
  roleMiddleware("student"),
  joinClass,
);

router.put(
  "/editClass/:classId",
  verifyToken,
  roleMiddleware("teacher"),
  editClass
);

router.delete(
  "/deleteClass/:classId",
  verifyToken,
  roleMiddleware("teacher"),
  deleteClass
);



module.exports = router;
