
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const testEmailConnection = async () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
  }
  return true;
};

export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
  }

  const from =
    process.env.EMAIL_FROM || "Calzare <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error(error.message || "Email sending failed");
  }

  return data;
};
