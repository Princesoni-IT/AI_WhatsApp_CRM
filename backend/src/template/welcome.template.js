import baseEmailLayout from "./layouts/baseEmailLayout.js";

const welcomeTemplate = (name) => {
    return baseEmailLayout({
        title: "Welcome to AI WhatsApp CRM 🎉",

        content: `
            <p>Hi <strong>${name}</strong>,</p>

            <p>Your email has been successfully verified.</p>

            <p>
                Your account is now active and ready to use.
            </p>

            <p>
                Thank you for joining AI WhatsApp CRM.
            </p>

            <p>
                We are excited to have you with us.
            </p>
        `,
    });
};

export default welcomeTemplate;