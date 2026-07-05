"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const userController_1 = require("../controllers/userController");
const roleMiddleware_1 = __importDefault(require("../middleware/roleMiddleware"));
const User_1 = __importDefault(require("../models/User"));
router.get("/fix-db", async (req, res) => {
    try {
        await User_1.default.updateMany({}, { $set: { recentUsers: [] } });
        res.send("<h1>Database fixed! You can now use the app.</h1>");
    }
    catch (err) {
        res.send("Error fixing db: " + (err instanceof Error ? err.message : "Unknown error"));
    }
});
router.get("/getUsers", verifyToken_1.default, userController_1.getAllUsers);
router.get("/getContact", verifyToken_1.default, userController_1.getContact);
router.get("/:id", verifyToken_1.default, userController_1.getUserProfile);
router.post("/addContact", verifyToken_1.default, userController_1.addNewContact);
router.get("/getAllStudents", verifyToken_1.default, (0, roleMiddleware_1.default)("teacher"), userController_1.getAllStudents);
router.get("/getAllTeachers", verifyToken_1.default, (0, roleMiddleware_1.default)("student"), userController_1.getAllTeachers);
exports.default = router;
//# sourceMappingURL=user.js.map