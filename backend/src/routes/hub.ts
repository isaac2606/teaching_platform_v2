import express from "express";
const router = express.Router();
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/roleMiddleware";

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
  kickStudent
 } from "../controllers/hubController";
import { verify  } from "jsonwebtoken";

router.post("/", verifyToken, authorize("teacher"), createHub);

router.put("/:id/leave", verifyToken, authorize("student"), leaveHub);

router.put("/:id/kick/:studentId", verifyToken, authorize("teacher"), kickStudent);

router.get("/getHubs", verifyToken, getAllHubs);

router.get("/fix-index", fixIndex);

router.get("/stats", verifyToken, authorize("teacher"), getDashboardStats);

router.get("/my-hubs", verifyToken, getMyHubs);

router.get("/getStudents/:hubId",verifyToken,authorize("teacher"),getStudents)

router.get("/invite/:inviteToken", verifyToken, getHubByInviteToken);

router.get("/:id", verifyToken, getHubById);

router.put("/:id", verifyToken, authorize("teacher"), updateHub);

router.delete("/:id", verifyToken, authorize("teacher"), deleteHub);

router.get("/:hubId",verifyToken, getChatHistory)

router.post("/join/:inviteToken",verifyToken, joinHubByInviteToken)

export default router;
