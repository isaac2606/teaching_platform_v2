"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const messageController_1 = require("../controllers/messageController");
router.get("/private/:receiverId", verifyToken_1.default, messageController_1.getPrivateChatHistory);
router.get("/public/:hubId", verifyToken_1.default, messageController_1.getPublicChatHistory);
exports.default = router;
//# sourceMappingURL=message.js.map