import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Otp from "@/lib/models/Otp"; // Import the new OTP model
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "mr.sanskar19@gmail.com",
    pass: process.env.EMAIL_PASS || "ojvh oekf oyou perg",
  },
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    // 1. Verify User Exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Save to OTP Collection
    // First, delete any existing OTPs for this email to prevent duplicates
    await Otp.deleteMany({ email });
    
    // Create new OTP document (Auto-expires in 5 mins via Schema)
    await Otp.create({
      email,
      otp
    });

    // 4. Professional "FoodsLink" Email Template
    const mailOptions = {
      from: `"FoodsLink Security" <no-reply@foodslinkx.com>`,
      to: email,
      subject: "Reset Your Password - FoodsLink",
      text: `Your OTP is ${otp}. Valid for 5 minutes.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; }
            .container { max-width: 500px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            .header { background-color: #e11d48; padding: 30px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
            .content { padding: 40px 30px; text-align: center; color: #334155; }
            .otp-box { background-color: #fff1f2; border: 2px dashed #e11d48; border-radius: 12px; padding: 15px; margin: 25px 0; display: inline-block; }
            .otp-code { color: #e11d48; font-size: 36px; font-weight: 900; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
            .note { font-size: 13px; color: #64748b; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
               <h1>FoodsLink</h1>
            </div>
            
            <div class="content">
              <h2 style="margin-top: 0; color: #0f172a;">Password Reset</h2>
              <p>Hello <strong>${user.name || 'User'}</strong>,</p>
              <p>We received a request to reset the password for your FoodsLink account. Use the code below to proceed:</p>
              
              <div class="otp-box">
                <h1 class="otp-code">${otp}</h1>
              </div>

              <p class="note">This code is valid for <strong>5 minutes</strong>.<br>If you did not request this, please ignore this email.</p>
            </div>

            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} FoodsLink. All rights reserved.</p>
              <p>Secure Automation System</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}