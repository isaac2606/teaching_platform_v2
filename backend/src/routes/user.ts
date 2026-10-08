import express from "express";
const router = express.Router();
import verifyToken from "../middleware/verifyToken";
import { getAllUsers, getUserProfile ,getContact ,addNewContact,getAllTeachers,getAllStudents } from "../controllers/userController";
import { verify  } from "jsonwebtoken";
import permit from "../middleware/requireGlobalRole"

import User from "../models/User";

router.get("/getUsers", verifyToken, getAllUsers);
router.get("/getContact",verifyToken,getContact);

router.get("/:id", verifyToken,getUserProfile);
router.post("/addContact",verifyToken,addNewContact);

router.get("/getAllStudents",verifyToken,permit("teacher"),getAllStudents);

router.get("/getAllTeachers",verifyToken,permit("student"),getAllTeachers);



export default router;