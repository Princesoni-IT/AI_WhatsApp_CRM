import { Router } from "express";
import {
    registerValidator,
    loginValidator,
} from "../validators/auth.validator.js";

import {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    refreshAccessToken,
} from "../controllers/auth.controller.js";

import validate from "../middleware/validate.js";
import verifyJWT from "../middleware/auth.middleware.js";

const router = Router();

router.post(
    "/refresh-token",
    refreshAccessToken
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