import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// --- Configuration (Defined locally as requested) ---
// Note: It is highly recommended to use environment variables for sensitive credentials
const transporter = nodemailer.createTransport({
  service: "gmail", // or use host: 'smtp.example.com', port: 587
  auth: {
    user: process.env.EMAIL_USER, // e.g., 'your-email@gmail.com'
    pass: process.env.EMAIL_PASS, // e.g., your app password
  },
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      // For security, do not reveal if the user exists or not, but for debugging:
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Set Expiry (10 minutes from now)
    const otpExpires = Date.now() + 10 * 60 * 1000;

    // 3. Update User Record
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // 4. Send Email
    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Use the OTP below to proceed:</p>
          <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
          <p>This code is valid for 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}