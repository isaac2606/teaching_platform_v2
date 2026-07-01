const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const authorize = require("../middleware/roleMiddleware");

const {
    getPrivateChatHistory,
    getPublicChatHistory
} = require("../controllers/messageController");



router.get("/private/:receiverId", verifyToken , getPrivateChatHistory);

router.get("/public/:hubId",verifyToken , getPublicChatHistory)



module.exports = router;