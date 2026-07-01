import { Request, Response } from "express";
declare const logout: (req: Request, res: Response) => Promise<void>;
declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const refresh: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export { register, logout, login, refresh };
//# sourceMappingURL=authControllers.d.ts.map