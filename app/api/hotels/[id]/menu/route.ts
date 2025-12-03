import { connectDB } from "@/lib/db";
import Menu from "@/lib/models/menu";
// 👇 IMPORT THIS to register the model with Mongoose
import Category from "@/lib/models/Category"; 
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id: hotelId } = await params;

    // Ensure Category model is registered before query
    // (This line is a safety check, though the import above usually suffices)
    if (!Category) console.log("Category model not loaded");

    const menuItems = await Menu.find({
      hotelId: hotelId,
      available: true // Only fetch available items
    })
    .populate('category') // Now Mongoose knows what 'category' is
    .sort({ createdAt: -1 });

    return NextResponse.json({ menu: menuItems });
  } catch (error: any) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items", details: error.message },
      { status: 500 }
    );
  }
}