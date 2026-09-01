import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { resetPassword } from "../../services/auth/reset-password.service.js";
export const resetPasswordController = asyncHandler(async (req, res) => {
    const result = await resetPassword({
        email: req.body.email,
        newPassword: req.body.newPassword,
        confirmPassword: req.body.confirmPassword,
    });
    res
        .status(200)
        .json(new ApiResponse(200, result, "Password reset successfully."));
});
//# sourceMappingURL=reset-password.controller.js.map