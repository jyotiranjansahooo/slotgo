import { Request, Response, NextFunction, RequestHandler } from "express";
type AsyncHandler<P = Record<string, string>, ResBody = unknown, ReqBody = unknown, ReqQuery = Record<string, unknown>> = (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => Promise<unknown>;
declare const asyncHandler: <P = Record<string, string>, ResBody = unknown, ReqBody = unknown, ReqQuery = Record<string, unknown>>(handler: AsyncHandler<P, ResBody, ReqBody, ReqQuery>) => RequestHandler<P, ResBody, ReqBody, ReqQuery>;
export default asyncHandler;
