import User from "../models/User.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/tokenGenerator.js";
import hashToken from "../utils/hashToken.js";
import verifyEmailTemplate from "../template/verifyEmail.template.js";
import { sendEmail } from "../services/email.service.js";


//Helper Function
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh tokens"
        );
    }
};

//Registration

const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, "Email already exists");
    }

    // Create User
    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
    });

    // Generate verification token
const verificationToken = generateToken();

// Save hashed token
user.emailVerificationToken = hashToken(verificationToken);

// Expiry after 24 hours
user.emailVerificationExpiry = new Date(
    Date.now() + 24 * 60 * 60 * 1000
);

await user.save({ validateBeforeSave: false });

// Verification URL
const verificationUrl =
    `${process.env.VERIFY_EMAIL_URL}?token=${verificationToken}`;

// Email HTML
const html = verifyEmailTemplate(
    user.firstName,
    verificationUrl
);

// Send email
await sendEmail({
    to: user.email,
    subject: "Verify Your Email - AI WhatsApp CRM",
    html,
});

// Fetch safe user
const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -__v -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry"
);

if (!createdUser) {
    throw new ApiError(
        500,
        "Something went wrong while registering user"
    );
}

return res.status(201).json(
    new ApiResponse(
        201,
        createdUser,
        "Registration successful. Please check your email to verify your account."
    )
);
});

//login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find User
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check Password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Generate Tokens
   const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

    // Remove Sensitive Data
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -__v"
    );

    // Cookie Options
    const options = {
        httpOnly: true,
        secure: false, // true in production with HTTPS
        sameSite: "lax",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "Login successful"
            )
        );
});


const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "Current user fetched successfully"
        )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: false, // Production me true
        sameSite: "lax",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                null,
                "Logged out successfully"
            )
        );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken,
                    },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

 const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        throw new ApiError(400, "Verification token is required");
    }

    // Hash incoming token
    const hashedToken = hashToken(token);

    // Find user
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: new Date() },
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired verification token");
    }

    // Verify account
    user.isVerified = true;

    // Remove token
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Email verified successfully"
        )
    );
});

export {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    refreshAccessToken,
    verifyEmail,
};