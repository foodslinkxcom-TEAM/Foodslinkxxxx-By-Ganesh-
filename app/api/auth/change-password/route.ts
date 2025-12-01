import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getAuthCookie, verifyToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// --- 1. POST: Change Password using Old Password (Requires Login) ---
export async function POST(request: NextRequest) {
  try {
    // A. Authentication Check (From your reference)
    let token = request.nextUrl.searchParams.get("token");
    if (!token) token = await getAuthCookie();

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // B. Logic
    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();
    // @ts-ignore - Ignoring TS error for generic payload type
    const user = await User.findById(payload.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // C. Verify Old Password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Incorrect old password" }, { status: 400 });
    }

    // D. Hash and Save New Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return NextResponse.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// --- 2. PATCH: Reset Password using OTP (Does not require Login) ---
export async function PATCH(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // A. Verify OTP (Assumes user model has 'otp' and 'otpExpires' fields)
    // Ensure otp matches and hasn't expired (current time < expiry time)
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // B. Hash and Save New Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // C. Clear OTP fields after use
    user.otp = undefined;
    user.otpExpires = undefined;
    
    await user.save();

    return NextResponse.json({ message: "Password reset successfully" });

  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}