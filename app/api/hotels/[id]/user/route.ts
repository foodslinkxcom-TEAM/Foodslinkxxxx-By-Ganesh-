import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    // 1. Get hotelId directly from the URL params
    const { id: hotelId } = await params;

    // 2. Find users in MongoDB
    const users = await User.find({ hotelId:hotelId });

    // 3. Return data
    return NextResponse.json({ success: true, count: users.length, data: users });

  } catch (error:any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}