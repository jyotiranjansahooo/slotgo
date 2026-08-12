import { Request, Response, NextFunction } from "express";
declare const notFoundMiddleware: (req: Request, _res: Response, next: NextFunction) => void;
export default notFoundMiddleware;
