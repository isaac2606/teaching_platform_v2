"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const upload_1 = __importDefault(require("../middleware/upload"));
const announcementController_1 = require("../controllers/announcementController");
// create an announcement
router.post("/add", verifyToken_1.default, upload_1.default.single("image"), announcementController_1.addAnnouncement);
// get all announcements
router.get("/getAnounc", verifyToken_1.default, announcementController_1.getAllAnnouncements);
// get hub feed
router.get("/hub/:hubId", verifyToken_1.default, announcementController_1.getHubFeed);
exports.default = router;
//# sourceMappingURL=announcement.js.map