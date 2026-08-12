import ApiError from "../utils/ApiError.js";
const requireRole = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication required.");
        }
        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(403, "You do not have permission to perform this action.");
        }
        next();
    };
};
export default requireRole;
//# sourceMappingURL=role.middleware.js.map