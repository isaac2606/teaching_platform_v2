import { Request, Response } from "express";
declare const createClass: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const getClassesByHub: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const assignStudent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const joinClass: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const editClass: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const deleteClass: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export { createClass, getClassesByHub, assignStudent, joinClass, editClass, deleteClass };
//# sourceMappingURL=classController.d.ts.map