import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { loginService } from "../../services/auth/login.service.js";
export const loginController = asyncHandler(async (req, res) => {
    const result = await loginService(req.body);
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json(new ApiResponse(200, {
        user: {
            id: result.user._id.toString(),
            firstName: result.user.name.first,
            lastName: result.user.name.last,
            email: result.user.email,
            phoneNumber: result.user.phoneNumber,
            role: result.user.role,
        },
        accessToken: result.accessToken,
    }, "Login successful"));
});
//# sourceMappingURL=login.controller.js.map