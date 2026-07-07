import { Router } from "express";
import multer from "multer";
import path from "path";
import { createContact, uploadContacts, getContacts } from "../controllers/contact.controller.js";
import validate from "../middleware/validate.js";
import verifyJWT from "../middleware/auth.middleware.js";
import { createContactValidator } from "../validators/contact.validator.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = [".csv", ".xls", ".xlsx"];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            return cb(new Error("Only CSV and Excel files are allowed"), false);
        }
        cb(null, true);
    },
});

router.post(
    "/manual",
    verifyJWT,
    authLimiter,
    createContactValidator,
    validate,
    createContact
);

router.post(
    "/upload",
    verifyJWT,
    authLimiter,
    upload.single("file"),
    uploadContacts
);

router.get(
    "/",
    verifyJWT,
    getContacts
);

export default router;
