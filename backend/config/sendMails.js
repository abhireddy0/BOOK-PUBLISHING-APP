// config/sendMails.js
require("dotenv").config();
const nodemailer = require("nodemailer");

const EMAIL = (process.env.EMAIL || "").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "").trim().replace(/\s+/g, "");

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

async function trySend(transporter, mail) {
  try {
    return await transporter.sendMail(mail);
  } catch (err) {
    const hint = err?.response?.includes("535")
      ? "Gmail says credentials not accepted. Use a 16-char App Password, ensure 'from' equals EMAIL, and run DisplayUnlockCaptcha once."
      : "";
    err.message = `${err.message}${hint ? " — " + hint : ""}`;
    throw err;
  }
}

async function sendMail(to, otp) {
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
    return await trySend(t465, mail);
  } catch (e465) {
    const t587 = buildTransporter({ port: 587, secure: false });
    return await trySend(t587, mail);
  }
}

module.exports = sendMail;
