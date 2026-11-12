import { register, logout, login, refresh  } from '../controllers/authControllers';

import express from "express"

import User from "../models/User";
import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";

import verifyToken from "../middleware/verifyToken";
import validateRequest from '../middleware/validateRequest';
import { LoginSchema,RegisterSchema } from '../schemas/authSchemas';
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  limit: 20, // Max 20 requests per IP per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again after 15 minutes."
  },
  skip: () => process.env.NODE_ENV === "test", // Bypass during automated tests
});

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key-change-this";


router.post("/Register", authLimiter, validateRequest(RegisterSchema), register)

router.post("/login", authLimiter, validateRequest(LoginSchema), login)

router.post("/logout",verifyToken, logout)

router.post("/refresh", authLimiter, refresh)


export default router;