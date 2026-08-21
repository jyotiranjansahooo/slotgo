import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { googleLoginService } from "../../services/auth/google.service.js";
export const googleLoginController = asyncHandler(async (req, res) => {
    const { credential, role } = req.body;
    if (!credential) {
        return res.status(400).json(new ApiResponse(400, [], "Google credential is required."));
    }
    const result = await googleLoginService({
        credential,
        role,
    });
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json(new ApiResponse(200, {
        user: {
            id: result.user._id.toString(),
            firstName: result.user.name.first,
            lastName: result.user.name.last,
            email: result.user.email,
            phoneNumber: result.user.phoneNumber,
            role: result.user.role,
        },
        accessToken: result.accessToken,
    }, "Google login successful"));
});
//# sourceMappingURL=google.controller.js.map