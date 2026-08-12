import { Request, Response, NextFunction } from "express";
declare const errorMiddleware: (err: Error, req: Request, res: Response, _next: NextFunction) => void;
export default errorMiddleware;
