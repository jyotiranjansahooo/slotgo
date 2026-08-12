import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AUTH } from "../constants/auth.js";
export const generateAccessToken = (user) => {
    const payload = {
        userId: user._id.toString(),
        role: user.role,
    };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: AUTH.ACCESS_TOKEN.EXPIRES_IN,
    });
};
export const generateRefreshToken = (user) => {
    const payload = {
        userId: user._id.toString(),
        role: user.role,
    };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: AUTH.REFRESH_TOKEN.EXPIRES_IN,
    });
};
export const verifyAccessToken = (token) => {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
};
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
};
//# sourceMappingURL=jwt.js.map