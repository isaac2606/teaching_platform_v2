import { Request, Response, CookieOptions } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/verifyToken";
interface DecodedToken {
  userId: string;
  role?: string;
}

const getJwtSecret = () => process.env.JWT_SECRET || "eduspace-default-jwt-secret-key-2026";
const getRefreshTokenSecret = () => process.env.REFRESH_TOKEN_SECRET || "eduspace-default-refresh-secret-key-2026";

const isProduction = process.env.NODE_ENV === "production";

// Cross-site cookie configuration for production deployment (e.g. Vercel + Render)
const getAccessTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 15 * 60 * 1000, // 15 mins
});

const getRefreshTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

const getClearCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
});

const logout= async (req: Request, res: Response)=>{
    try{
    const userId = req.user.userId;

    await User.findByIdAndUpdate(userId,{refreshToken:null});
    res.clearCookie("accessToken", getClearCookieOptions());
    res.clearCookie("refreshToken", getClearCookieOptions());

    res.status(200).json({message:"logged out succesfully"})
    }catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
}

const login = async (req: Request, res: Response)=>{
    try{
        const normalizedEmail = req.body.email ? req.body.email.toLowerCase().trim() : "";
        const user = await User.findOne({
            email: normalizedEmail
        })
        if(!user){
            return res.status(404).json("user not found");
        }
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password!
        );
        if(!validPassword){
            return res.status(400).json("wrong password");
        }

        const accessToken = jwt.sign(
            {
                userId:user._id,
                email:user.email,
                username:user.username,
                role:user.role

            },
            getJwtSecret(),
            {expiresIn:"15m"},
        );
        const refreshToken = jwt.sign(

            {
                userId : user._id,

            },
            getRefreshTokenSecret(),
            {expiresIn:"7d"}
        );
        user.refreshToken = await bcrypt.hash(refreshToken, 10);
        await user.save();
        
        const {password,...userWithoutPassword} = user.toObject();


        res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
        res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
        res.status(200).json({
            message:"loggin succesful",
            user:userWithoutPassword,
            
        })
    }catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
}


const register = async (req: Request, res: Response)=> {
    try{
        const normalizedEmail = req.body.email ? req.body.email.toLowerCase().trim() : "";
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = new User({
            username: req.body.username,
            email: normalizedEmail,
            password: hashedPassword,
            role: req.body.role
        });

        await user.save();

        const accessToken = jwt.sign(
            {
                userId:user._id,
                email:user.email,
                username:user.username,
                role:user.role

            },
            getJwtSecret(),
            {expiresIn:"15m"},
        );


        const refreshToken = jwt.sign(
            {
                userId : user._id,
            },
            getRefreshTokenSecret(),
            { expiresIn: "7d" }
        );
        user.refreshToken = await bcrypt.hash(refreshToken, 10);
        await user.save();
        const {password,...userWithoutPassword} = user.toObject();

        res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
        res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
        res.status(200).json({
            message:"user registered succesfully",
            user: userWithoutPassword
        })
    }catch (err: any) {
        // Handle MongoDB duplicate key error (code 11000) for concurrent race conditions
        if (err?.code === 11000) {
            return res.status(400).json({ message: "User with this email already exists." });
        }
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json("An unknown error occurred");
        }
    }
}

const refresh = async (req: Request, res: Response) => {
    try {
        const  refreshToken  = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ message: "Refresh token is missing" });

        jwt.verify(refreshToken, getRefreshTokenSecret(), async (err: any, payload: any) => {
            if (err) return res.status(403).json({ message: "Refresh token is invalid or expired" });
            if(!payload) return res.status(403).json({ message: "No payload" });
            
            const decodedPayload = payload as DecodedToken;
            const user = await User.findById(decodedPayload.userId);

            if (!user || !user.refreshToken) {
                return res.status(403).json({ message: "Invalid refresh token" });
            }
            
            const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
            if (!isMatch) {
                return res.status(403).json({ message: "Invalid refresh token" });
            }

            const newAccessToken = jwt.sign(
                {
                    userId: user._id,
                    email: user.email,
                    username: user.username,
                    role: user.role
                },
                getJwtSecret(),
                { expiresIn: "15m" }
            );

            const newRefreshToken = jwt.sign(
                { userId: user._id },
                getRefreshTokenSecret(),
                {expiresIn:"7d"}
            );
            user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
            await user.save();

            res.cookie("accessToken", newAccessToken, getAccessTokenCookieOptions());
            res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());

            res.status(200).json({
                
            });
        });
    } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
};

export { register, logout, login, refresh };
