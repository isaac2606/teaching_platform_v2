"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicChatHistory = exports.getPrivateChatHistory = void 0;
const Message_1 = __importDefault(require("../models/Message"));
const getPrivateChatHistory = async (req, res) => {
    try {
        const messages = await Message_1.default.find({
            $or: [
                { sender: req.user.userId, receiver: req.params.receiverId },
                { receiver: req.user.userId, sender: req.params.receiverId }
            ]
        }).populate("sender", "username").populate("receiver", "username").sort({ createdAt: 1 });
        res.status(200).json(messages);
    }
    catch (err) {
        res.status(500).json(err);
    }
};
exports.getPrivateChatHistory = getPrivateChatHistory;
const getPublicChatHistory = async (req, res) => {
    try {
        const messages = await Message_1.default.find({ hubId: req.params.hubId }).populate("sender", "username").sort({ createdAt: 1 });
        res.status(200).json(messages);
    }
    catch (err) {
        res.status(500).json(err);
    }
};
exports.getPublicChatHistory = getPublicChatHistory;
//# sourceMappingURL=messageController.js.map