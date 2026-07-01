"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const HubSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true
    },
    teacher: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    students: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User",
        }],
    announcements: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Announcement"
        }],
    classes: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Class"
        }],
    inviteToken: {
        type: String,
        unique: true,
    },
    messages: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Message"
        }
    ]
}, { timestamps: true });
exports.default = mongoose_1.default.model("Hub", HubSchema);
//# sourceMappingURL=Hub.js.map