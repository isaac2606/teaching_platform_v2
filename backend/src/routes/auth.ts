import { register, logout, login, refresh  } from '../controllers/authControllers.js';

import express from "express"

import User from "../models/User";
import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";

import verifyToken from "../middleware/verifyToken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key-change-this";


router.post("/Register", register)

router.post("/login", login)

router.post("/logout",verifyToken, logout)

router.post("/refresh",refresh)


export default router;