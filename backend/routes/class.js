const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
    createClass,
    getClassesByGroup,
    assignStudent
} = require("../controllers/classController");

// create a class
router.post("/createClass", verifyToken, roleMiddleware("teacher"), createClass);

// get classes for a specific group
router.get("/getClasses/:groupId", verifyToken, roleMiddleware("teacher"), getClassesByGroup);

// assign student to a class
router.post("/:classId/assign", verifyToken, roleMiddleware("teacher"), assignStudent);

module.exports = router;
