
import nodemailer from "nodemailer";

const getTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS?.replace(/\s/g, "")
    }
  });
};

export const testEmailConnection = async () => {
  const transporter = getTransporter();
  try {
    return await transporter.verify();
  } finally {
    transporter.close();
  }
};

export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP_USER or SMTP_PASS is missing");
  }

  const transporter = getTransporter();

  try {
    return await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html
    });
  } finally {
    transporter.close();
  }
};
