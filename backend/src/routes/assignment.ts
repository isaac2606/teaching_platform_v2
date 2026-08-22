import express from "express";
const router = express.Router();

import verifyToken from "../middleware/verifyToken";
import upload from "../middleware/upload";
import { 
    createAssignment,
    getAssignmentsByHub,
    getAssignmentById
} from "../controllers/assignmentController";

// create an assignment
router.post("/create", verifyToken, upload.single("image"), createAssignment);

// get all assignments for a specific hub
router.get("/hub/:hubId", verifyToken, getAssignmentsByHub);

// get a specific assignment by ID
router.get("/:id", verifyToken, getAssignmentById);

export default router;
