import { Router } from "express";
import { registerUser } from "../controllers/auth.controller.js";
import { registerValidator } from "../validators/auth.validator.js";
import validate from "../middleware/validate.js";

const router = Router();

router.post(
    "/register",
    registerValidator,
    validate,
    registerUser
);

export default router;