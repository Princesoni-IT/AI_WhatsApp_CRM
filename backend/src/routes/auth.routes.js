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

const router = Router();

router.post("/verify-email", verifyEmail);

router.post(
    "/refresh-token",
    refreshAccessToken
);

router.post(
    "/resend-verification-email",
    resendVerificationEmailValidator,
    validate,
    resendVerificationEmail
);

router.post(
    "/forgot-password",
    forgotPasswordValidator,
    validate,
    forgotPassword
);

router.post(
    "/reset-password",
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
    registerValidator,
    validate,
    registerUser
);


router.post(
    "/login",
    loginValidator,
    validate,
    loginUser
);

export default router;