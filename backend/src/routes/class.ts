import express from "express";
const router = express.Router();

import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/requireHubRole";
import roleMiddleware from "../middleware/requireGlobalRole";
import upload from "../middleware/upload";

import { createClass,
  getClassesByHub,
  assignStudent,
  joinClass,
  editClass,
  deleteClass,
  recordAttendance
 } from "../controllers/classController";

router.post(
  "/createClass",
  verifyToken,
  authorize("owner", "co_teacher"),
  upload.single("imageUrl"),
  createClass,
);

router.get(
  "/getClasses/:hubId",
  verifyToken,
  authorize("owner", "co_teacher", "student"),
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

router.post(
  "/:classId/attendance",
  verifyToken,
  roleMiddleware("teacher"),
  recordAttendance
);



export default router;
