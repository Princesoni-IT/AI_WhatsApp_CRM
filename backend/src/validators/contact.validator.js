import { body } from "express-validator";

const createContactValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Contact name is required")
        .isLength({ max: 100 })
        .withMessage("Contact name must be 100 characters or fewer"),
    body("phoneNumber")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required")
        .matches(/^\+?[0-9]{7,20}$/)
        .withMessage("Phone number must be valid and contain only digits and optional leading +"),
];

const uploadContactsValidator = [];

export { createContactValidator, uploadContactsValidator };
