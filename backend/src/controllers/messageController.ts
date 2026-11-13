import { Request, Response } from "express";
import mongoose from "mongoose";
import Message from "../models/Message";
import Membership from "../models/Membership";

const getPrivateChatHistory  = async (req: Request, res: Response)=>{
    try{
        const { receiverId } = req.params;
        const userId = req.user?.userId;

        if (!receiverId || typeof receiverId !== "string" || !mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ error: "Invalid receiver ID format" });
        }

        const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 100);
        const before = req.query.before as string;

        const query: any = {
            $or:[
                { sender: userId, receiver: receiverId },
                { receiver: userId, sender: receiverId }
            ]
        };

        if (before) {
            const beforeDate = new Date(before);
            if (!isNaN(beforeDate.getTime())) {
                query.createdAt = { $lt: beforeDate };
            }
        }

        // Fetch newest 50 before cursor
        const messages = await Message.find(query)
            .populate("sender", "username")
            .populate("receiver", "username")
            .sort({ createdAt: -1 })
            .limit(limit);

        // Reverse to return in chronological order [oldest -> newest]
        const chronologicalMessages = [...messages].reverse();

        res.status(200).json({
            messages: chronologicalMessages,
            hasMore: messages.length === limit,
            oldestCursor: chronologicalMessages.length > 0 ? (chronologicalMessages[0]?.createdAt || null) : null,
        });
    }catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json("An unknown error occurred");
        }
    }
}

const getPublicChatHistory  = async (req: Request, res: Response)=>{
    try{
        const { hubId } = req.params;
        const userId = req.user?.userId;

        if (!hubId || typeof hubId !== "string" || !mongoose.Types.ObjectId.isValid(hubId)) {
            return res.status(400).json({ error: "Invalid hub ID format" });
        }

        // 🔒 1. Verify that the requesting user is an active member of this hub
        const isMember = await Membership.exists({ user: userId, hub: hubId });
        if (!isMember) {
            return res.status(403).json({ error: "Access denied. You are not a member of this hub." });
        }

        const channel = (req.query.channel as string) || "general";
        const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 100);
        const before = req.query.before as string;

        const query: any = { hubId, channel };

        if (before) {
            const beforeDate = new Date(before);
            if (!isNaN(beforeDate.getTime())) {
                query.createdAt = { $lt: beforeDate };
            }
        }

        // Fetch newest 50 before cursor
        const messages = await Message.find(query)
            .populate("sender", "username")
            .sort({ createdAt: -1 })
            .limit(limit);

        // Reverse to return in chronological order [oldest -> newest]
        const chronologicalMessages = [...messages].reverse();

        res.status(200).json({
            messages: chronologicalMessages,
            hasMore: messages.length === limit,
            oldestCursor: chronologicalMessages.length > 0 ? (chronologicalMessages[0]?.createdAt || null) : null,
        });
    }catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json("An unknown error occurred");
        }
    }
}

export {
  getPrivateChatHistory,
  getPublicChatHistory
};
