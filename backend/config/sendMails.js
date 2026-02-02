// config/sendMails.js
require("dotenv").config();
const nodemailer = require("nodemailer");

// Brevo SMTP configuration
const BREVO_SMTP_HOST = process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com";
const BREVO_SMTP_PORT = process.env.BREVO_SMTP_PORT || 587;
const BREVO_SMTP_USER = process.env.BREVO_SMTP_USER;
const BREVO_SMTP_PASS = process.env.BREVO_SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@yourdomain.com";
const FROM_NAME = process.env.FROM_NAME || "StoryVerse";

// Create transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    if (!BREVO_SMTP_USER || !BREVO_SMTP_PASS) {
      throw new Error("BREVO_SMTP_USER and BREVO_SMTP_PASS must be set in .env file");
    }

    transporter = nodemailer.createTransport({
      host: BREVO_SMTP_HOST,
      port: BREVO_SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: BREVO_SMTP_USER,
        pass: BREVO_SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });
  }
  return transporter;
}

async function sendMail(to, otp) {
  try {
    // Validate inputs
    if (!to || !otp) {
      throw new Error("Email and OTP are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error("Invalid email address format");
    }

    console.log(`[Email] Sending OTP to ${to} via Brevo SMTP...`);

    const transport = getTransporter();

    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: to,
      subject: "Reset Your Password - StoryVerse",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Your OTP for Password Reset is:</p>
          <div style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #666;">This code will expire in 5 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
      text: `Your OTP for Password Reset is ${otp}. It expires in 5 minutes.`,
    };

    const result = await transport.sendMail(mailOptions);

    console.log(`[Email] ✓ Successfully sent to ${to}`);
    console.log(`[Email] Message ID: ${result.messageId}`);

    return result;
  } catch (error) {
    console.error("[Email] Failed to send:", error.message);

    // Enhanced error messages
    if (error.code === "EAUTH" || error.responseCode === 535) {
      throw new Error("Brevo SMTP authentication failed. Please check your SMTP username and password.");
    } else if (error.code === "ECONNECTION" || error.code === "ETIMEDOUT") {
      throw new Error("Cannot connect to Brevo SMTP server. Please check your internet connection.");
    } else if (error.responseCode === 550) {
      throw new Error("Brevo rejected the email. The sender email may not be verified.");
    } else if (error.responseCode === 554) {
      throw new Error("Brevo daily sending limit reached.");
    }

    throw new Error(`Email service error: ${error.message}`);
  }
}

module.exports = sendMail;
