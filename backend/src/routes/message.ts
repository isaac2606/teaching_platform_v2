import express from "express";
const router = express.Router();

import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/roleMiddleware";

import { getPrivateChatHistory,
    getPublicChatHistory
 } from "../controllers/messageController";



router.get("/private/:receiverId", verifyToken , getPrivateChatHistory);

router.get("/public/:hubId",verifyToken , getPublicChatHistory)



export default router;