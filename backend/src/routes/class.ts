import express from "express";
const router = express.Router();

import verifyToken from "../middleware/verifyToken";
import roleMiddleware from "../middleware/roleMiddleware";
import upload from "../middleware/upload";

import { createClass,
  getClassesByHub,
  assignStudent,
  joinClass,
  editClass,
  deleteClass,
 } from "../controllers/classController";

router.post(
  "/createClass",
  verifyToken,
  roleMiddleware("teacher"),
  upload.single("imageUrl"),
  createClass,
);

router.get(
  "/getClasses/:hubId",
  verifyToken,
  roleMiddleware("teacher"),
  getClassesByHub,
);

router.post(
  "/:classId/assign",
  verifyToken,
  roleMiddleware("teacher"),
  assignStudent,
);

router.post(
  "/join/:inviteToken",
  verifyToken,
  roleMiddleware("student"),
  joinClass,
);

router.put(
  "/editClass/:classId",
  verifyToken,
  roleMiddleware("teacher"),
  editClass
);

router.delete(
  "/deleteClass/:classId",
  verifyToken,
  roleMiddleware("teacher"),
  deleteClass
);



export default router;
