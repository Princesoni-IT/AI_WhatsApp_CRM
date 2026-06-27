import { Router } from "express";
import {
    registerValidator,
    loginValidator,
} from "../validators/auth.validator.js";

import {
    registerUser,
    loginUser,
} from "../controllers/auth.controller.js";
import validate from "../middleware/validate.js";

const router = Router();

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