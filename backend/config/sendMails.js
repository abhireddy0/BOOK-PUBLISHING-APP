// config/sendMails.js
require("dotenv").config();
const nodemailer = require("nodemailer");

const EMAIL = (process.env.EMAIL || "").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "").trim().replace(/\s+/g, "");

// Timeout wrapper to prevent indefinite hangs
function withTimeout(promise, timeoutMs, errorMessage) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

function buildTransporter({ port, secure }) {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port,            // 465 or 587
    secure,          // true for 465, false for 587
    auth: { user: EMAIL, pass: EMAIL_PASS },
    connectionTimeout: 15000,
    socketTimeout: 20000,
  });
}

async function trySend(transporter, mail, portInfo) {
  try {
    console.log(`[Email] Attempting to send via ${portInfo}...`);
    const result = await transporter.sendMail(mail);
    console.log(`[Email] ✓ Successfully sent via ${portInfo} to ${mail.to}`);
    return result;
  } catch (err) {
    console.error(`[Email] ✗ Failed on ${portInfo}:`, err.message);
    const hint = err?.response?.includes("535")
      ? "Gmail says credentials not accepted. Use a 16-char App Password, ensure 'from' equals EMAIL, and run DisplayUnlockCaptcha once."
      : "";
    err.message = `${err.message}${hint ? " — " + hint : ""}`;
    throw err;
  }
}

async function sendMailInternal(to, otp) {
  if (!EMAIL || !EMAIL_PASS) {
    throw new Error("EMAIL/EMAIL_PASS missing. Use Gmail App Password (2-Step Verification).");
  }
  const mail = {
    from: `"StoryVerse" <${EMAIL}>`, // MUST match EMAIL
    to,
    subject: "Reset Your Password",
    html: `<p>Your OTP for Password Reset is <b>${otp}</b>. It expires in 5 minutes.</p>`,
  };
  const t465 = buildTransporter({ port: 465, secure: true });
  try {
    return await trySend(t465, mail, "port 465 (SSL)");
  } catch (e465) {
    const t587 = buildTransporter({ port: 587, secure: false });
    return await trySend(t587, mail, "port 587 (STARTTLS)");
  }
}

async function sendMail(to, otp) {
  try {
    // Validate inputs
    if (!to || !otp) {
      throw new Error("Email and OTP are required");
    }

    // Wrap entire operation with 25s timeout
    return await withTimeout(
      sendMailInternal(to, otp),
      25000,
      'Email sending timed out after 25 seconds'
    );
  } catch (error) {
    if (error.message.includes('timed out')) {
      console.error('[Email] Operation timeout:', error.message);
      throw new Error('Email service timeout. Please try again in a moment.');
    }
    throw error;
  }
}

module.exports = sendMail;
