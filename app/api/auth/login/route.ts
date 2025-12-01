import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/lib/db"; // your db connection util
import User from "@/lib/models/User"; // your mongoose model
import { generateToken } from "@/lib/auth"; // your jwt util
import bcrypt from "bcrypt";

export async function POST(request:NextRequest) {
  try {
    // ✅ connect to database
    await connectDB();

    // ✅ parse JSON body
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // ✅ find user
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // ✅ generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      hotelId: user.hotelId || null,
    });

    // ✅ send success response
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        hotelId: user.hotelId,
      },
      token,
    });
  } catch (err:any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
