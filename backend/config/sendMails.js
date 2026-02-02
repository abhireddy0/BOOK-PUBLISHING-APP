// config/sendMails.js
require("dotenv").config();

// Brevo HTTP API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@yourdomain.com";
const FROM_NAME = process.env.FROM_NAME || "StoryVerse";

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

    // Check API key
    if (!BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY must be set in environment variables");
    }

    console.log(`[Email] Sending OTP to ${to} via Brevo HTTP API...`);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: FROM_NAME,
          email: FROM_EMAIL
        },
        to: [{ email: to }],
        subject: "Reset Your Password - StoryVerse",
        htmlContent: `
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
        textContent: `Your OTP for Password Reset is ${otp}. It expires in 5 minutes.`
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[Email] Brevo API error:", JSON.stringify(errorData));

      if (response.status === 401) {
        throw new Error("Brevo API authentication failed. Please check your API key.");
      } else if (response.status === 400) {
        throw new Error(`Brevo rejected the request: ${errorData.message || "Invalid request"}`);
      } else if (response.status === 429) {
        throw new Error("Brevo rate limit exceeded. Please try again later.");
      }

      throw new Error(`Brevo API error: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();

    console.log(`[Email] ✓ Successfully sent to ${to}`);
    console.log(`[Email] Message ID: ${result.messageId}`);

    return result;
  } catch (error) {
    console.error("[Email] Failed to send:", error.message);
    throw new Error(`Email service error: ${error.message}`);
  }
}

module.exports = sendMail;
