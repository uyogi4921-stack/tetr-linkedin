import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import nodemailer from "nodemailer";

function generatePassword(): string {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return Response.json({ error: "Email is required." }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Always return success to prevent email enumeration
  const successResponse = Response.json({
    message: "If an account with that email exists, a new password has been sent.",
  });

  // Check Gmail credentials are configured
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("GMAIL_USER or GMAIL_APP_PASSWORD not configured");
    return Response.json(
      { error: "Email service is not configured. Please contact admin." },
      { status: 500 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) return successResponse;

  const newPassword = generatePassword();
  const hashed = await hashPassword(newPassword);

  // Send email FIRST — only update password if email succeeds
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"TETR-Connect" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: "Your new TETR-Connect password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; background-color: #2D6A4F; border-radius: 12px; color: white; font-weight: bold; font-size: 24px; line-height: 48px;">T</div>
          </div>
          <h2 style="color: #1a1a1a; text-align: center; margin-bottom: 8px;">Password Reset</h2>
          <p style="color: #666; text-align: center; font-size: 14px;">Hi ${user.fullName}, your password has been reset.</p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
            <p style="color: #666; font-size: 12px; margin: 0 0 8px 0;">Your new password:</p>
            <p style="color: #1a1a1a; font-size: 20px; font-weight: bold; letter-spacing: 2px; margin: 0; font-family: monospace;">${newPassword}</p>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">Please sign in with this password. If you didn't request this, please contact admin immediately.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #bbb; font-size: 11px; text-align: center;">TETR-Connect &middot; Tetr College of Business</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    return Response.json(
      { error: "Failed to send email. Please try again or contact admin." },
      { status: 500 }
    );
  }

  // Email sent successfully — NOW update the password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return successResponse;
}
