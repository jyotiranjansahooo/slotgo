import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import User from "../models/User.js";
const authMiddleware = async (req, _res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization?.startsWith("Bearer ")) {
            throw new ApiError(401, "Authentication required.");
        }
        const token = authorization.split(" ")[1];
        if (!token) {
            throw new ApiError(401, "Access token is required.");
        }
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.userId).select("_id name email phoneNumber role isActive isVerified");
        if (!user) {
            throw new ApiError(401, "User account not found.");
        }
        if (!user.isActive) {
            throw new ApiError(403, "Your account has been deactivated.");
        }
        req.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
};
export default authMiddleware;
//# sourceMappingURL=auth.middleware.js.map