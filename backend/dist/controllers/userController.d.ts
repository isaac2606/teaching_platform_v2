import { Request, Response } from "express";
declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
declare const getUserProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const getContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const addNewContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const getAllStudents: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const getAllTeachers: (req: Request, res: Response) => Promise<void>;
export { getAllUsers, getUserProfile, addNewContact, getContact, getAllStudents, getAllTeachers };
//# sourceMappingURL=userController.d.ts.map