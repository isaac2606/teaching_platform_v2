"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AnnouncementSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    teacher: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    hubs: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Hub",
            required: true
        }],
    imageUrl: {
        type: String,
        default: ""
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Announcement", AnnouncementSchema);
//# sourceMappingURL=Announcement.js.map