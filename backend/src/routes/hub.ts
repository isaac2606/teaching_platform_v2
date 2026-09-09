import express from "express";
const router = express.Router();
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/requireHubRole";

import { createHub,
  leaveHub,
  getAllHubs,
  getMyHubs,
  getHubById,
  getHubByInviteToken,
  updateHub,
  deleteHub,
  getDashboardStats,
  fixIndex,
  getChatHistory,
  joinHubByInviteToken,
  getStudents,
  kickStudent,
  toggleChannelLock
 } from "../controllers/hubController";
import { verify  } from "jsonwebtoken";
import permit from "../middleware/requireGlobalRole";

router.post("/", verifyToken,permit("owner"), createHub);

router.put("/:id/leave", verifyToken, authorize("student"), leaveHub);

router.put("/:id/kick/:studentId", verifyToken, authorize("owner","co_teacher"), kickStudent);

router.put("/:hubId/lock-channel", verifyToken, authorize("owner"), toggleChannelLock);

router.get("/getHubs", verifyToken, getAllHubs);

router.get("/fix-index", fixIndex);

router.get("/stats", verifyToken, authorize("owner"), getDashboardStats);

router.get("/my-hubs", verifyToken, getMyHubs);

router.get("/getStudents/:hubId",verifyToken,authorize("owner"),getStudents)

router.get("/invite/:inviteToken", verifyToken, getHubByInviteToken);

router.get("/:id", verifyToken, getHubById);

router.put("/:id", verifyToken, authorize("owner"), updateHub);

router.delete("/:id", verifyToken, authorize("owner"), deleteHub);

router.get("/:hubId",verifyToken, getChatHistory)

router.post("/join/:inviteToken",verifyToken, joinHubByInviteToken)

export default router;
