"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const authHeader = (req.headers.authorization || req.headers['x-access-token']);
    const token = authHeader && (authHeader.startsWith('Bearer ') || authHeader.startsWith('bearer '))
        ? authHeader.split(' ')[1]
        : authHeader;
    if (!token) {
        return res.status(401).json('No token provided');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        /*res.json({
         messages:req.user
       })*/
        next();
    }
    catch (err) {
        res.status(403).json('Token is invalid or expired');
    }
};
exports.default = verifyToken;
//# sourceMappingURL=verifyToken.js.map