const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const authorize = require("../middleware/roleMiddleware");

const {
    getPrivateChatHistory,
    getPublicChatHistory,
    getUsersMessaging
} = require("../controllers/messageController");



router.get("/private/:receiverId", verifyToken , getPrivateChatHistory);

router.get("/public/:hubId",verifyToken , getPublicChatHistory);

router.get("/contacts", verifyToken, getUsersMessaging);


module.exports = router;