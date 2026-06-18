const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const authorize = require("../middleware/roleMiddleware");

const {
    getPrivateChatHistory
} = require("../controllers/messageController");


router.get("/private/:receiverId", verifyToken , getPrivateChatHistory);




module.exports = router;