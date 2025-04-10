import { createTransport } from 'nodemailer';

export const sendEmail = async(to,subject,text) => {
    const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
    });

    transporter.sendMail({
        to,subject,text
    });
}