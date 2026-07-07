import { Request, Response } from "express";
declare const createHub: (req: Request, res: Response) => Promise<void>;
declare const leaveHub: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const kickStudent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const getAllHubs: (req: Request, res: Response) => Promise<void>;
declare const getMyHubs: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const getHubById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const getHubByInviteToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const joinHubByInviteToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const updateHub: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const deleteHub: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const getDashboardStats: (req: Request, res: Response) => Promise<void>;
declare const fixIndex: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const getChatHistory: (req: Request, res: Response) => Promise<void>;
declare const getStudents: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export { createHub, leaveHub, getAllHubs, getMyHubs, getHubById, getHubByInviteToken, updateHub, deleteHub, getDashboardStats, fixIndex, getChatHistory, joinHubByInviteToken, getStudents, kickStudent };
//# sourceMappingURL=hubController.d.ts.map