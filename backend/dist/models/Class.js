"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ClassSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true
    },
    teacher: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    hub: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Hub",
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
    date: {
        type: String
    },
    imageUrl: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        default: "Live Video"
    },
    duration: {
        type: String,
        default: "1h 00m"
    },
    inviteToken: {
        type: String,
        unique: true,
        sparse: true
    },
    dues: {
        type: Number,
        default: 0
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Class", ClassSchema);
//# sourceMappingURL=Class.js.map