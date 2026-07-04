import { Request, Response, NextFunction } from "express";
declare const authorize: (...roles: any[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export default authorize;
//# sourceMappingURL=roleMiddleware.d.ts.map