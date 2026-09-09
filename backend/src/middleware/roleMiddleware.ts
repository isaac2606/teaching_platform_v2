import { Request, Response, NextFunction } from "express";
import Membership from "../models/Membership";



const authorize = (...roles:string[])=>{
    return (req: Request, res: Response, next: NextFunction)=>{
        
        if(!roles.includes(req.user.role)){
            return res.status(403).json({message:"Access denied no permision",
                msg:req.user
            })

        }
        next();

    }
}


const authorizes = (...roles:string[])=>{
    return async (req:Request , res:Response, next:NextFunction)=>{
        const hubId = req.params.hubId || req.params.id || req.body.hubId;
        if(hubId && req.user.userId){
            try{
                const membership = await Membership.findOne({
                user:req.user.userId,
                hub:hubId
            })
            if(!membership){
                return res.status(403).json({message:'forbidden'})
            }else{
                if(roles.includes(membership.role)){
                    next()
                }else{
                    return res.status(403).json({message:'forbidden'})
                }
            }
             
        }catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
            

        }else{
            res.status(403).json({message:"forbidden"})

        }
    }
}

export default authorize;