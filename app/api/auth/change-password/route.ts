import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Otp from "@/lib/models/Otp"; // Import the separate OTP model
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// --- 1. POST: Change Password using Old Password (Logged in or knowing credentials) ---
export async function POST(request: NextRequest) {
  try {
    const { email, oldPassword, newPassword } = await request.json();

    if (!email || !oldPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // 1. Find User by Email (as requested)
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Verify Old Password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Incorrect old password" }, { status: 400 });
    }

    // 3. Hash and Save New Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return NextResponse.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// --- 2. PATCH: Reset Password using OTP (Forgot Password flow) ---
export async function PATCH(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    // A. Verify OTP using the OTP Model
    // We search by Email. If the doc exists, it hasn't expired (TTL) yet.
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return NextResponse.json({ error: "OTP expired or invalid" }, { status: 400 });
    }

    // Check if the code matches exactly
    if (otpRecord.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // B. Find the User
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    // C. Hash and Save New Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // D. Delete the used OTP immediately (security best practice)
    await Otp.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({ message: "Password reset successfully" });

  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}