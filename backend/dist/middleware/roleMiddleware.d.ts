import { Request, Response, NextFunction } from "express";
declare const authorize: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export default authorize;
//# sourceMappingURL=roleMiddleware.d.ts.map