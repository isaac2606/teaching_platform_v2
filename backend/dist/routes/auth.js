"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authControllers_js_1 = require("../controllers/authControllers.js");
const express_1 = __importDefault(require("express"));
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key-change-this";
router.post("/Register", authControllers_js_1.register);
router.post("/login", authControllers_js_1.login);
router.post("/logout", verifyToken_1.default, authControllers_js_1.logout);
router.post("/refresh", authControllers_js_1.refresh);
exports.default = router;
//# sourceMappingURL=auth.js.map