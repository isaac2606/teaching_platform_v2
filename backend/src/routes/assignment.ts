import express from "express";
const router = express.Router();

import verifyToken from "../middleware/verifyToken";
import upload from "../middleware/upload";
import { 
    createAssignment,getAssignmentsByHub,
 } from "../controllers/assignmentController";





export default router;
