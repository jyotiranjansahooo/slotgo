import { Router } from "express";

import validate from "../middleware/validate.middleware.js";

import { registerSchema } from "../validations/auth/register.validation.js";
import { loginSchema } from "../validations/auth/login.validation.js";
import { verifyOtpSchema } from "../validations/auth/verify-otp.validation.js";
import { resendOtpSchema } from "../validations/auth/resend-otp.validation.js";

import { forgotPasswordSchema } from "../validations/auth/forgot-password.validation.js";

import { verifyPasswordResetOtpSchema } from "../validations/auth/verify-password-reset-otp.validation.js";
import { resetPasswordSchema } from "../validations/auth/reset-password.validation.js";

import { resendOtpController } from "../controllers/auth/resend-otp.controller.js";
import { registerController } from "../controllers/auth/register.controller.js";
import { loginController } from "../controllers/auth/login.controller.js";
import { verifyOtpController } from "../controllers/auth/verify-otp.controller.js";
import { googleLoginController } from "../controllers/auth/google.controller.js";

import { forgotPasswordController } from "../controllers/auth/forgot-password.controller.js";

import { verifyPasswordResetOtpController } from "../controllers/auth/verify-password-reset-otp.controller.js";

import { resetPasswordController } from "../controllers/auth/reset-password.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), registerController);

router.post("/login", validate(loginSchema), loginController);

router.post("/google", googleLoginController);

router.post("/verify-otp", validate(verifyOtpSchema), verifyOtpController);

router.post("/resend-otp", validate(resendOtpSchema), resendOtpController);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordController,
);

router.post(
  "/forgot-password/verify",
  validate(verifyPasswordResetOtpSchema),
  verifyPasswordResetOtpController,
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPasswordController,
);

export default router;
