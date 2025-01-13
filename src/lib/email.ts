import nodemailer from "nodemailer";
import { env } from "@/env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  }
});

export type EmailTemplate = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailTemplate) {
  try {
    console.log("Attempting to send email to:", to, "with subject:", subject);

    const info = await transporter.sendMail({
      from: env.EMAIL_USER,
      to,
      subject,
      html,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });

    console.log("Email sent successfully:", {
      messageId: info.messageId,
      response: info.response,
      to,
      subject
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email:", {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : error,
      to,
      subject
    });
    
    return { success: false, error };
  }
}

export function generatePasswordResetEmail(
  userName: string,
  resetLink: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Hello ${userName},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background-color: #7c3aed; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>This link will expire in 5 minutes for security reasons.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>Interview Genie Team</p>
    </div>
  `;
} 