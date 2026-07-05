import express from "express";
const router = express.Router();
import verifyToken from "../middleware/verifyToken";
import { getAllUsers, getUserProfile ,getContact ,addNewContact,getAllTeachers,getAllStudents } from "../controllers/userController";
import { verify  } from "jsonwebtoken";
import roleMiddleware from "../middleware/roleMiddleware";

import User from "../models/User";

router.get("/fix-db", async (req, res) => {
    try {
        await User.updateMany({}, { $set: { recentUsers: [] } });
        res.send("<h1>Database fixed! You can now use the app.</h1>");
    } catch (err) {
        res.send("Error fixing db: " + (err instanceof Error ? err.message : "Unknown error"));
    }
});

router.get("/getUsers", verifyToken, getAllUsers);
router.get("/getContact",verifyToken,getContact);

router.get("/:id", verifyToken,getUserProfile);
router.post("/addContact",verifyToken,addNewContact);

router.get("/getAllStudents",verifyToken,roleMiddleware("teacher"),getAllStudents);

router.get("/getAllTeachers",verifyToken,roleMiddleware("student"),getAllTeachers);



export default router;