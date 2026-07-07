import { body } from "express-validator";

export const sendCampaignValidator = [
    body("messageTemplate")
        .trim()
        .notEmpty()
        .withMessage("Message template is required")
        .isLength({ min: 10, max: 1000 })
        .withMessage("Message template must be between 10 and 1000 characters"),
    body("recipientIds")
        .isArray({ min: 1 })
        .withMessage("At least one recipient is required")
        .custom((value) => value.every((id) => typeof id === "string" && id.trim().length > 0))
        .withMessage("Each recipient ID must be a valid string"),
    body("imageUrl")
        .optional()
        .isURL({ protocols: ['http', 'https'], require_protocol: true })
        .withMessage("Image URL must be a valid HTTP/HTTPS URL"),
];
