"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const roleMiddleware_1 = __importDefault(require("../middleware/roleMiddleware"));
const hubController_1 = require("../controllers/hubController");
router.post("/", verifyToken_1.default, (0, roleMiddleware_1.default)("teacher"), hubController_1.createHub);
router.put("/:id/leave", verifyToken_1.default, (0, roleMiddleware_1.default)("student"), hubController_1.leaveHub);
router.put("/:id/kick/:studentId", verifyToken_1.default, (0, roleMiddleware_1.default)("teacher"), hubController_1.kickStudent);
router.get("/getHubs", verifyToken_1.default, hubController_1.getAllHubs);
router.get("/fix-index", hubController_1.fixIndex);
router.get("/stats", verifyToken_1.default, (0, roleMiddleware_1.default)("teacher"), hubController_1.getDashboardStats);
router.get("/my-hubs", verifyToken_1.default, hubController_1.getMyHubs);
router.get("/getStudents/:hubId", verifyToken_1.default, (0, roleMiddleware_1.default)("teacher"), hubController_1.getStudents);
router.get("/invite/:inviteToken", verifyToken_1.default, hubController_1.getHubByInviteToken);
router.get("/:id", verifyToken_1.default, hubController_1.getHubById);
router.put("/:id", verifyToken_1.default, (0, roleMiddleware_1.default)("teacher"), hubController_1.updateHub);
router.delete("/:id", verifyToken_1.default, (0, roleMiddleware_1.default)("teacher"), hubController_1.deleteHub);
router.get("/:hubId", verifyToken_1.default, hubController_1.getChatHistory);
router.post("/join/:inviteToken", verifyToken_1.default, hubController_1.joinHubByInviteToken);
exports.default = router;
//# sourceMappingURL=hub.js.map