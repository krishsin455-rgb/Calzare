
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT || 587) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const testEmailConnection = async () => {
  return transporter.verify();
};

export const sendEmail = async ({ to, subject, html }) => {
  const from =
    process.env.EMAIL_FROM || process.env.SMTP_USER;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Gmail SMTP credentials are missing.");
  }

  return transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
};
