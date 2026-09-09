import { Request, Response, NextFunction } from "express";


const permit = (...roles:string[])=>{
    return async (req:Request , res:Response, next:NextFunction)=>{
            if(!roles.includes(req.user.role)){
                return res.status(403).json({message:"forbidden"})

            }
            next()
            
        }
    }
    
    
export default  permit;