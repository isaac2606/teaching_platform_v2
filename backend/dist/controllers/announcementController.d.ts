import { Request, Response } from "express";
declare const addAnnouncement: (req: Request, res: Response) => Promise<void>;
declare const getAllAnnouncements: (req: Request, res: Response) => Promise<void>;
declare const getHubFeed: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export { addAnnouncement, getAllAnnouncements, getHubFeed };
//# sourceMappingURL=announcementController.d.ts.map