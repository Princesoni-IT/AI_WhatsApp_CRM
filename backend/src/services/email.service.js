import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});
export const sendEmail = async ({
    to,
    subject,
    html,
    text = "",
}) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html,
    };

    return await transporter.sendMail(mailOptions);
};

export default transporter;