"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const upload_1 = __importDefault(require("../middleware/upload"));
router.post("/", verifyToken_1.default, upload_1.default.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file provided" });
        }
        // Cloudinary returns the full absolute HTTPS URL in req.file.path
        res.status(200).json({ filename: req.file.path });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json("An unknown error occurred");
        }
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map