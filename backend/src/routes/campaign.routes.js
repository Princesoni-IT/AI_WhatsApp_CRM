import { Router } from "express";
import {
    sendCampaign,
    getCampaigns,
    getCampaignById,
} from "../controllers/campaign.controller.js";
import validate from "../middleware/validate.js";
import verifyJWT from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { sendCampaignValidator } from "../validators/campaign.validator.js";

const router = Router();

router.post(
    "/send",
    verifyJWT,
    authLimiter,
    sendCampaignValidator,
    validate,
    sendCampaign
);

router.get("/", verifyJWT, getCampaigns);
router.get("/:id", verifyJWT, getCampaignById);

export default router;
