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
        // Cloudinary returns the full absolute HTTPS URL in req.file.path
        res.status(200).json({ filename: req.file.path });
    }
    catch (err) {
        res.status(500).json(err);
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map