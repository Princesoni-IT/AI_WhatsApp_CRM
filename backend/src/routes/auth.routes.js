import { Router } from "express";
import {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    resendVerificationEmailValidator,
} from "../validators/auth.validator.js";

import {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    refreshAccessToken,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerificationEmail,
} from "../controllers/auth.controller.js";

import validate from "../middleware/validate.js";
import verifyJWT from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/verify-email", authLimiter, verifyEmail);

router.post(
    "/refresh-token",
    refreshAccessToken
);

router.post(
    "/resend-verification-email",
    authLimiter,
    resendVerificationEmailValidator,
    validate,
    resendVerificationEmail
);

router.post(
    "/forgot-password",
    authLimiter,
    forgotPasswordValidator,
    validate,
    forgotPassword
);

router.post(
    "/reset-password",
    authLimiter,
    resetPasswordValidator,
    validate,
    resetPassword
);

router.post(
    "/logout",
    verifyJWT,
    logoutUser
);

router.get(
    "/me",
    verifyJWT,
    getCurrentUser
);

router.post(
    "/register",
    authLimiter,
    registerValidator,
    validate,
    registerUser
);


router.post(
    "/login",
    authLimiter,
    loginValidator,
    validate,
    loginUser
);

export default router;