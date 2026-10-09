import express from "express";
const router = express.Router();

import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/requireHubRole";
import permit from "../middleware/requireGlobalRole";
import { resolveHubFromClass } from "../middleware/resolvers";
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
  resolveHubFromClass,
  authorize("owner", "co_teacher"),
  assignStudent,
);

router.post(
  "/join/:inviteToken",
  verifyToken,
  permit("student"),
  joinClass,
);

router.put(
  "/editClass/:classId",
  verifyToken,
  resolveHubFromClass,
  authorize("owner", "co_teacher"),
  editClass
);

router.delete(
  "/deleteClass/:classId",
  verifyToken,
  resolveHubFromClass,
  authorize("owner", "co_teacher"),
  deleteClass
);

router.post(
  "/:classId/attendance",
  verifyToken,
  resolveHubFromClass,
  authorize("owner", "co_teacher"),
  recordAttendance
);



export default router;
