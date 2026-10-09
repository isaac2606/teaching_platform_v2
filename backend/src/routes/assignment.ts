import express from "express";
const router = express.Router();

import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/requireHubRole";
import { resolveHubFromAssignment } from "../middleware/resolvers";
import upload from "../middleware/upload";
import { 
    createAssignment,
    getAssignmentsByHub,
    getAssignmentById
} from "../controllers/assignmentController";

// create an assignment
router.post("/create", verifyToken, authorize("owner", "co_teacher"), upload.single("image"), createAssignment);

// get all assignments for a specific hub
router.get("/hub/:hubId", verifyToken, authorize("owner", "co_teacher", "student"), getAssignmentsByHub);

// get a specific assignment by ID
router.get("/:id", verifyToken, resolveHubFromAssignment, authorize("owner", "co_teacher", "student"), getAssignmentById);

export default router;
