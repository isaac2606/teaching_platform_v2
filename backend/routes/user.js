const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { getAllUsers, getUserProfile ,getRecentUsers } = require("../controllers/userController");

router.get("/getUsers", verifyToken, getAllUsers);
router.get("/:id", getUserProfile);

//get users who recently messaged you



module.exports = router;