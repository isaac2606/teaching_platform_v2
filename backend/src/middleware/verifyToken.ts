import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface DecodedToken {
  userId: string;
  role: string;
}
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // Read the token from the HttpOnly cookie instead of the Authorization header
  const token = req.cookies?.accessToken;
  
  if (!token) {
    return res.status(401).json({ message: "Not authenticated. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Token is invalid or expired" });
  }
};



export default verifyToken;