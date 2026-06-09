const { register, logout, login } = require('../controllers/authControllers.js');


const router = require("express").Router()

const User  =require("../models/User");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

const verifyToken = require("../middleware/verifyToken");

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key-change-this";


router.post("/Register", register)

router.post("/login", login)

router.post("/logout",verifyToken, logout)



module.exports = router;