"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.login = exports.logout = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret-key-change-this";
const logout = async (req, res) => {
    try {
        const userId = req.user.userId;
        await User_1.default.findByIdAndUpdate(userId, { refreshToken: null });
        res.status(200).json({ message: "logged out succesfully" });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json("An unknown error occurred");
        }
    }
};
exports.logout = logout;
const login = async (req, res) => {
    try {
        const user = await User_1.default.findOne({
            email: req.body.email
        });
        if (!user) {
            return res.status(404).json("user not found");
        }
        const validPassword = await bcrypt_1.default.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json("wrong password");
        }
        const accessToken = jsonwebtoken_1.default.sign({
            userId: user._id,
            email: user.email,
            username: user.username,
            role: user.role
        }, JWT_SECRET, { expiresIn: "15d" });
        const refreshToken = jsonwebtoken_1.default.sign({
            userId: user._id,
        }, REFRESH_TOKEN_SECRET);
        user.refreshToken = refreshToken;
        await user.save();
        const { password, ...userWithoutPassword } = user._doc;
        res.status(200).json({
            message: "loggin succesful",
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: userWithoutPassword,
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json("An unknown error occurred");
        }
    }
};
exports.login = login;
const register = async (req, res) => {
    try {
        const existingUser = await User_1.default.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists." });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(req.body.password, salt);
        const user = new User_1.default({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role
        });
        await user.save();
        const accessToken = jsonwebtoken_1.default.sign({
            userId: user._id,
            email: user.email,
            username: user.username,
            role: user.role
        }, JWT_SECRET, { expiresIn: "15d" });
        const refreshToken = jsonwebtoken_1.default.sign({
            userId: user._id,
        }, REFRESH_TOKEN_SECRET);
        user.refreshToken = refreshToken;
        await user.save();
        res.status(200).json({
            message: "user registered succesfully",
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json("An unknown error occurred");
        }
    }
};
exports.register = register;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(401).json({ message: "Refresh token is missing" });
        jsonwebtoken_1.default.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, payload) => {
            if (err)
                return res.status(403).json({ message: "Refresh token is invalid or expired" });
            const user = await User_1.default.findById(payload.userId);
            if (!user || user.refreshToken !== refreshToken) {
                return res.status(403).json({ message: "Invalid refresh token" });
            }
            const newAccessToken = jsonwebtoken_1.default.sign({
                userId: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            }, JWT_SECRET, { expiresIn: "15d" });
            const newRefreshToken = jsonwebtoken_1.default.sign({ userId: user._id }, REFRESH_TOKEN_SECRET);
            user.refreshToken = newRefreshToken;
            await user.save();
            res.status(200).json({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.status(500).json("An unknown error occurred");
        }
    }
};
exports.refresh = refresh;
//# sourceMappingURL=authControllers.js.map