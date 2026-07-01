"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const roleMiddleware_1 = __importDefault(require("../middleware/roleMiddleware"));
const upload_1 = __importDefault(require("../middleware/upload"));
const classController_1 = require("../controllers/classController");
router.post("/createClass", verifyToken_1.default, (0, roleMiddleware_1.default)("teacher"), upload_1.default.single("imageUrl"), classController_1.createClass);
router.get("/getClasses/:hubId", verifyToken_1.default, (0, roleMiddleware_1.default)("teacher"), classController_1.getClassesByHub);
router.post("/:classId/assign", verifyToken_1.default, (0, roleMiddleware_1.default)("teacher"), classController_1.assignStudent);
router.post("/join/:inviteToken", verifyToken_1.default, (0, roleMiddleware_1.default)("student"), classController_1.joinClass);
router.put("/editClass/:classId", verifyToken_1.default, (0, roleMiddleware_1.default)("teacher"), classController_1.editClass);
router.delete("/deleteClass/:classId", verifyToken_1.default, (0, roleMiddleware_1.default)("teacher"), classController_1.deleteClass);
exports.default = router;
//# sourceMappingURL=class.js.map