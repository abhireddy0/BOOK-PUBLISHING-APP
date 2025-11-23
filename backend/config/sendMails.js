require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});


transporter.verify((err, success) => {
  if (err) {
    console.log("❌ SMTP error:", err.message);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

const sendMail = async (to, otp) => {
  console.log("DEBUG OTP ->", to, otp); 

  return transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "Reset Your Password",
    html: `<p>Your OTP for Password Reset is <b>${otp}</b>. It expires in 5 minutes.</p>`,
  });
};

module.exports = sendMail;
