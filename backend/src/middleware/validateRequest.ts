import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ZodObject } from "zod";



const validateRequest = (schema:ZodObject)=>{
    return async (req:Request, res:Response,next:NextFunction) =>{
        try{
            await schema.parseAsync(req.body);
            next();
        }catch(error){
            if(error instanceof ZodError){
                res.status(400).json({ message: "Validation failed ",error});
      } else {
        res.status(500).json({ message: "Internal server error during validation" });
      }
            
        }
    }
}

export default validateRequest;