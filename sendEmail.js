const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
   // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // this must be the app password from Google
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: `"MERN OTP Verification" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Greetings",
    html: `"<b>Hello <${process.env.EMAIL_USER}>!</b>
    <b>${text}</b></p>"`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = sendEmail;
