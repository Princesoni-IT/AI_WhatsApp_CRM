import baseEmailLayout from "./layouts/baseEmailLayout.js";

const forgotPasswordTemplate = (name, resetUrl) => {
    return baseEmailLayout({
        title: "Reset Your Password",

        content: `
            <p>Hi <strong>${name}</strong>,</p>

            <p>We received a request to reset your password.</p>

            <p>If you requested this change, click the button below:</p>

            <div style="text-align:center; margin:30px 0;">
                <a href="${resetUrl}"
                    style="
                        background:#2563eb;
                        color:#ffffff;
                        padding:12px 24px;
                        text-decoration:none;
                        border-radius:6px;
                        display:inline-block;
                        font-weight:bold;
                    ">
                    Reset Password
                </a>
            </div>

            <p>This link will expire in <strong>15 minutes</strong>.</p>

            <p>If you didn't request a password reset, you can safely ignore this email.</p>
        `,
    });
};

export default forgotPasswordTemplate;