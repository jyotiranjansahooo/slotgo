import ApiError from "../utils/ApiError.js";
const adminMiddleware = (req, _res, next) => {
    if (!req.user) {
        return next(new ApiError(401, "Authentication required."));
    }
    if (req.user.role !== "admin") {
        return next(new ApiError(403, "Admin access required."));
    }
    next();
};
export default adminMiddleware;
//# sourceMappingURL=admin.middleware.js.map