import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new ApiError(
            400,
            "Validation Failed",
            errors.array().map((error) => ({
                field: error.path,
                message: error.msg,
            }))
        );
    }

    next();
};

export default validate;