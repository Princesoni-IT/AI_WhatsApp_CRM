import User from "../models/User.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/tokenGenerator.js";
import hashToken from "../utils/hashToken.js";
import verifyEmailTemplate from "../template/verifyEmail.template.js";
import { sendEmail } from "../services/email.service.js";
import welcomeTemplate from "../template/welcome.template.js";
import forgotPasswordTemplate from "../template/forgotPassword.template.js";


// ============================================================
// HELPER FUNCTION: Access & Refresh Token Generator
// ============================================================
// Ye function userId lekar user ko DB se fetch karta hai,
// dono tokens generate karta hai, refreshToken ko DB me save
// karta hai, aur dono tokens return karta hai.
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        // User model ke methods se tokens generate ho rahe hain
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // RefreshToken ko DB me store kar rahe hain future verification ke liye
        user.refreshToken = refreshToken;

        // validateBeforeSave: false — taaki baaki required fields validate na ho, sirf token save ho
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh tokens"
        );
    }
};


// ============================================================
// CONTROLLER: Register User
// ============================================================
// New user ko register karta hai. Steps:
// 1. Email duplicate check
// 2. User create
// 3. Email verification token generate & hash karke save
// 4. Verification email bhejo
// 5. Sensitive fields hatakar response bhejo
const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Step 1: Check karo ki email already registered toh nahi hai
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, "Email already exists");
    }

    // Step 2: Naya user DB me create karo
    const user = await User.create({
        firstName,
        lastName,
        email,
        password, // password model me pre-save hook se hash hoga
    });

    // Step 3: Plain random token generate karo (email me bhejna hai)
    const verificationToken = generateToken();

    // Hashed version DB me save karo — plain token kabhi DB me store nahi karte (security)
    user.emailVerificationToken = hashToken(verificationToken);

    // Token ki expiry 24 ghante set karo
    user.emailVerificationExpiry = new Date(
        Date.now() + 24 * 60 * 60 * 1000
    );

    await user.save({ validateBeforeSave: false });

    // Step 4: Verification URL banao jisme plain token query param me hoga
    const verificationUrl =
        `${process.env.VERIFY_EMAIL_URL}?token=${verificationToken}`;

    // Email template me firstName aur URL pass karo
    const html = verifyEmailTemplate(
        user.firstName,
        verificationUrl
    );

    // Email service se verification mail bhejo
    await sendEmail({
        to: user.email,
        subject: "Verify Your Email - AI WhatsApp CRM",
        html,
    });

    // Step 5: Sensitive fields exclude karke safe user object fetch karo
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -__v -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering user"
        );
    }

    // NOTE: Neeche commented code OTP/token-based testing ke liye tha (development only)
    // Abhi production flow use ho raha hai — sirf user data return ho raha hai

    // const responseData = {
    //     user: createdUser,
    // };

    // if (process.env.NODE_ENV === "development") {
    //     responseData.verificationToken = verificationToken;
    // }

    // return res.status(201).json(
    //     new ApiResponse(
    //         201,
    //         responseData,
    //         "Registration successful. Please check your email to verify your account."
    //     )
    // );

    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "Registration successful. Please check your email to verify your account."
        )
    );

});


// ============================================================
// CONTROLLER: Login User
// ============================================================
// Registered user ko login karta hai. Steps:
// 1. Email se user dhundo
// 2. Password verify karo
// 3. Email verification check karo
// 4. Access & Refresh tokens generate karo
// 5. Tokens HttpOnly cookies me set karke response bhejo
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Step 1: Email se user find karo
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Step 2: User model ka method use karke password compare karo (bcrypt internally)
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Step 3: Agar email verify nahi hui toh login block karo
    if (!user.isVerified) {
        throw new ApiError(
            403,
            "Please verify your email before logging in."
        );
    }

    // Step 4: Dono tokens generate karo
    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    // Sensitive fields remove karke clean user object lo
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -__v -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry"
    );

    // Step 5: Cookie options — httpOnly: true matlab JS se access nahi hoga (XSS protection)
    // secure: false — development me HTTP ke liye; production me true karna hai HTTPS ke liye
    const options = {
        httpOnly: true,
        secure: false, // true in production with HTTPS
        sameSite: "lax",
    };

    // Dono tokens cookies me set karo aur user data response me bhejo
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                },
                "Login successful"
            )
        );
});


// ============================================================
// CONTROLLER: Get Current User
// ============================================================
// Auth middleware (verifyJWT) ne req.user me already user set kar diya hota hai,
// toh bas wahi return kar dete hain — koi extra DB call nahi
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "Current user fetched successfully"
        )
    );
});


// ============================================================
// CONTROLLER: Logout User
// ============================================================
// User ka refreshToken DB se clear karta hai aur
// dono cookies browser se delete karta hai
const logoutUser = asyncHandler(async (req, res) => {
    // DB me refreshToken empty string se overwrite karo
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            },
        },
        {
            new: true, // updated document return ho (yahan use nahi ho raha, but good practice)
        }
    );

    const options = {
        httpOnly: true,
        secure: false, // Production me true
        sameSite: "lax",
    };

    // Browser se dono cookies clear karo
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


// ============================================================
// CONTROLLER: Refresh Access Token
// ============================================================
// Jab accessToken expire ho jaye, refreshToken se naya accessToken issue karta hai.
// Steps:
// 1. Cookie ya body se refreshToken lo
// 2. JWT verify karo
// 3. DB se user dhundo aur stored token se match karo
// 4. Naye dono tokens generate karo aur cookies me set karo
const refreshAccessToken = asyncHandler(async (req, res) => {
    // Cookie ya request body — dono jagah se token accept karo (mobile clients ke liye)
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        // JWT verify karo — agar expire ya tampered hai toh error aayega
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        // DB me stored token se incoming token match karo
        // Agar already use ho chuka hai toh dono alag honge
        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        // Naye tokens generate karo (rotate refresh token — security best practice)
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


// ============================================================
// CONTROLLER: Verify Email
// ============================================================
// Registration ke baad user email me aaya link click karta hai,
// jisme plain token hota hai. Ye controller:
// 1. Token hash karke DB se match karta hai
// 2. Expiry check karta hai
// 3. User ko verified mark karta hai
// 4. Welcome email bhejta hai
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        throw new ApiError(400, "Verification token is required");
    }

    // Incoming plain token ko hash karo taaki DB ke hashed token se compare ho sake
    const hashedToken = hashToken(token);

    // Matching user dhundo — token match ho aur expiry bhi valid ho
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: new Date() }, // expiry abhi baki ho
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired verification token");
    }

    // User ko verified mark karo
    user.isVerified = true;

    // Token aur expiry remove karo — ek baar use ho gaya, ab zaroorat nahi
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    // Welcome email bhejo verification ke baad
    const html = welcomeTemplate(user.firstName);

    await sendEmail({
        to: user.email,
        subject: "Welcome to AI WhatsApp CRM 🎉",
        html,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Email verified successfully"
        )
    );
});


// ============================================================
// CONTROLLER: Forgot Password
// ============================================================
// User apna password bhool gaya — reset link email me bhejna hai.
// Steps:
// 1. Email se user dhundo
// 2. Reset token generate karo (plain → email, hashed → DB)
// 3. 15 min expiry set karo
// 4. Reset URL email me bhejo
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;


    const user = await User.findOne({ email });

    if (!user) {
    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "If an account with this email exists, a password reset link has been sent."
        )
    );
}

    // Plain random token generate karo
    const resetToken = generateToken();

    // Hashed version DB me store karo
    user.forgotPasswordToken = hashToken(resetToken);

    // Token 15 minute me expire ho jayega
    user.forgotPasswordExpiry = new Date(
        Date.now() + 15 * 60 * 1000
    );

    await user.save({ validateBeforeSave: false });

    // Reset URL banao — plain token URL me hoga, DB me nahi
    const resetUrl =
        `${process.env.RESET_PASSWORD_URL}?token=${resetToken}`;

    // Email template me naam aur reset URL pass karo
    const html = forgotPasswordTemplate(
        user.firstName,
        resetUrl
    );

    await sendEmail({
        to: user.email,
        subject: "Reset Your Password - AI WhatsApp CRM",
        html,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Password reset link sent to your email."
        )
    );
});


// ============================================================
// CONTROLLER: Reset Password
// ============================================================
// User reset link se aata hai, naya password set karta hai.
// Steps:
// 1. Token validate karo (hash match + expiry check)
// 2. Naya password save karo (model ka pre-save hook hash karega)
// 3. Reset token DB se remove karo
const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token) {
        throw new ApiError(400, "Reset token is required");
    }

    // Incoming token hash karo DB se compare ke liye
    const hashedToken = hashToken(token);

    // Token match ho aur expiry valid ho tabhi user milega
    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: new Date() },
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired reset token");
    }

    // Naya password set karo — model ka pre-save hook isko hash karega automatically
    user.password = password;

    // Reset token aur expiry hata do — ek baar use ho gaya
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    // validateBeforeSave nahi diya — full validation chahiye password save ke waqt
    await user.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Password reset successfully"
        )
    );
});


// ============================================================
// EXPORTS
// ============================================================
export {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    refreshAccessToken,
    verifyEmail,
    forgotPassword,
    resetPassword,
};