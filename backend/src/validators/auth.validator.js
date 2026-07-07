import { body } from "express-validator";

export const registerValidator = [
    body("firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required")
        .bail()
        .isLength({ min: 2, max: 50 })
        .withMessage("First name must be between 2 and 50 characters"),

    body("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required")
        .bail()
        .isLength({ min: 2, max: 50 })
        .withMessage("Last name must be between 2 and 50 characters"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please enter a valid email")
        .isLength({ max: 100 })
        .withMessage("Email must be at most 100 characters")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage(
            "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"
        )
        .isLength({ max: 32 })
        .withMessage("Password must be at most 32 characters"),
];

export const loginValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .bail()
        .isEmail()
        .withMessage("Please enter a valid email")
        .isLength({ max: 100 })
        .withMessage("Email must be at most 100 characters")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ max: 32 })
        .withMessage("Password must be at most 32 characters"),
];

export const forgotPasswordValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .bail()
        .isEmail()
        .withMessage("Please enter a valid email")
        .isLength({ max: 100 })
        .withMessage("Email must be at most 100 characters")
        .normalizeEmail(),
];

export const resetPasswordValidator = [
    body("token")
        .notEmpty()
        .withMessage("Reset token is required"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .bail()
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage(
            "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"
        )
        .isLength({ max: 32 })
        .withMessage("Password must be at most 32 characters"),

    body("confirmPassword")
        .notEmpty()
        .withMessage("Confirm password is required")
        .isLength({ max: 32 })
        .withMessage("Confirm password must be at most 32 characters")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),
];

export const resendVerificationEmailValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .bail()
        .isEmail()
        .withMessage("Please enter a valid email")
        .isLength({ max: 100 })
        .withMessage("Email must be at most 100 characters")
        .normalizeEmail(),
];