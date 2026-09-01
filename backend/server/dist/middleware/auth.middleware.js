import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import User from "../models/User.js";
const authMiddleware = async (req, _res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization?.startsWith("Bearer ")) {
            throw new ApiError(401, "Authentication required.");
        }
        const token = authorization.substring(7).trim();
        if (!token) {
            throw new ApiError(401, "Access token is required.");
        }
        let decoded;
        try {
            decoded = verifyAccessToken(token);
        }
        catch (error) {
            /*
             * JWT EXPIRED
             *
             * Access token has expired.
             * Return 401 so the frontend can automatically
             * clear authentication and redirect to login.
             */
            if (error instanceof jwt.TokenExpiredError) {
                throw new ApiError(401, "Your session has expired. Please log in again.");
            }
            /*
             * Invalid JWT
             */
            if (error instanceof jwt.JsonWebTokenError) {
                throw new ApiError(401, "Invalid authentication token. Please log in again.");
            }
            throw error;
        }
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