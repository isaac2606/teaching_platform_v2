const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { getAllUsers, getUserProfile } = require("../controllers/userController");

router.get("/getUsers", verifyToken, getAllUsers);
router.get("/:id", getUserProfile);

module.exports = router;