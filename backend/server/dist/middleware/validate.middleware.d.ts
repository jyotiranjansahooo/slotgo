import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
declare const validate: <T>(schema: ZodSchema<T>) => (req: Request, _res: Response, next: NextFunction) => void;
export default validate;
