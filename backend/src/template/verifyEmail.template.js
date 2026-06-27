import baseEmailLayout from "./layouts/baseEmailLayout.js";

const verifyEmailTemplate = (name, verificationUrl) => {
    return baseEmailLayout({
        title: "Verify Your Email",

        content: `
            <p>Hi <strong>${name}</strong>,</p>

            <p>
            Welcome to <strong>AI WhatsApp CRM</strong>.
            </p>

            <p>
            Please verify your email address to activate your account.
            </p>

            <p>
            This verification link will expire in <strong>24 hours</strong>.
            </p>

            <p>
            If you did not create this account, simply ignore this email.
            </p>
        `,

        buttonText: "Verify Email",

        buttonUrl: verificationUrl,
    });
};

export default verifyEmailTemplate;