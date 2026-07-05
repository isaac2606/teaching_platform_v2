import { Request, Response, NextFunction } from "express";



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


export default authorize;