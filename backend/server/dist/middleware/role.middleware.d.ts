import { Request, Response, NextFunction } from "express";
import { UserRole } from "../constants/roles.js";
declare const requireRole: (...allowedRoles: UserRole[]) => (req: Request, _res: Response, next: NextFunction) => void;
export default requireRole;
