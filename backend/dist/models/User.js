"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["student", "teacher", "admin"],
        default: "student",
    },
    hubs: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Hub"
        }],
    students: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User"
        }],
    teachers: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User"
        }],
    recentUsers: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User"
        }],
    refreshToken: { type: String },
}, { timestamps: true });
exports.default = mongoose_1.default.model("User", UserSchema);
//# sourceMappingURL=User.js.map