import { Router } from "express";

import validate from "../middleware/validate.middleware.js";

import { registerSchema } from "../validations/auth/register.validation.js";
import { loginSchema } from "../validations/auth/login.validation.js";

import { registerController } from "../controllers/auth/register.controller.js";
import { loginController } from "../controllers/auth/login.controller.js";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  registerController
);

router.post(
  "/login",
  validate(loginSchema),
  loginController
);

export default router;