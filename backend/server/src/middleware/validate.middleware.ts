import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import ApiError from "../utils/ApiError.js";

const validate =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new ApiError(
            400,
            "Validation failed",
            error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            }))
          )
        );
        return;
      }

      next(error);
    }
  };

export default validate;