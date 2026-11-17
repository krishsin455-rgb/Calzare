import "dotenv/config";
import { sendEmail } from "./utils/email.js";

try {
  const result = await sendEmail({
    to: process.env.SMTP_USER,
    subject: "Calzare SMTP Test",
    html: "<h2>Calzare email sending works!</h2>"
  });

  console.log("EMAIL SENT:", result.messageId);
} catch (error) {
  console.error("EMAIL TEST FAILED:", {
    message: error.message,
    code: error.code,
    command: error.command
  });
}