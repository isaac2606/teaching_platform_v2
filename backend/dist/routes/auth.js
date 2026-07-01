"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authControllers_js_1 = require("../controllers/authControllers.js");
const express_1 = __importDefault(require("express"));
Router();
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key-change-this";
express_1.default.post("/Register", authControllers_js_1.register);
express_1.default.post("/login", authControllers_js_1.login);
express_1.default.post("/logout", verifyToken_1.default, authControllers_js_1.logout);
express_1.default.post("/refresh", authControllers_js_1.refresh);
exports.default = express_1.default;
//# sourceMappingURL=auth.js.map