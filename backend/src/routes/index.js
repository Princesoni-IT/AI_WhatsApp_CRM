import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import contactRoutes from "./contact.routes.js";
import campaignRoutes from "./campaign.routes.js";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/contacts", contactRoutes);
router.use("/campaigns", campaignRoutes);

export default router;