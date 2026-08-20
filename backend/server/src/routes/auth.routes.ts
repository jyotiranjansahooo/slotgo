import { Router } from "express";

import validate from "../middleware/validate.middleware.js";

import { registerSchema } from "../validations/auth/register.validation.js";
import { loginSchema } from "../validations/auth/login.validation.js";
import { verifyOtpSchema } from "../validations/auth/verify-otp.validation.js";
import { resendOtpSchema } from "../validations/auth/resend-otp.validation.js";
import { resendOtpController } from "../controllers/auth/resend-otp.controller.js";
import { registerController } from "../controllers/auth/register.controller.js";
import { loginController } from "../controllers/auth/login.controller.js";
import { verifyOtpController } from "../controllers/auth/verify-otp.controller.js";
import { googleLoginController } from "../controllers/auth/google.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), registerController);

router.post("/login", validate(loginSchema), loginController);
router.post("/google", googleLoginController);


router.post("/verify-otp", validate(verifyOtpSchema), verifyOtpController);

router.post("/resend-otp", validate(resendOtpSchema), resendOtpController);

export default router;
