import { connectDB } from "@/lib/db";
import Hotel from "@/lib/models/Hotel"; // Ensure you have this model
import User from "@/lib/models/User";
import { NextRequest, NextResponse } from "next/server";

// --- GET: Fetch Single Hotel Details ---
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 1. Await params first
  const { id } = await params;
  try {
    await connectDB();
    const hotel = await Hotel.findById(id);
    const user = await User.findOne({hotelId:hotel?._id});
    if (!hotel) return NextResponse.json({ error: "Hotel not found",id:id || "testing id" }, { status: 404 });
    const data = {
      user,
      hotel,
    };
    return NextResponse.json(data);
  } catch (error:any) {
    return NextResponse.json({ error: "Failed to fetch hotel",message:error.message,id:id || "testing id" }, { status: 500 });
  }
}

// --- PATCH: Update Hotel Details & Verify ---
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { plan, planExpiry, maxTables, locationVerificationRadius, verified } = body;

    await connectDB();

    const updatedHotel = await Hotel.findByIdAndUpdate(
      params.id,
      {
        plan,
        planExpiry,
        maxTables,
        locationVerificationRadius,
        verified,
        // If verified became true just now, we might want to set a 'verifiedAt' timestamp
        ...(verified ? { verifiedAt: new Date() } : {}) 
      },
      { new: true } // Return the updated document
    );

    if (!updatedHotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Hotel updated successfully", 
      hotel: updatedHotel 
    });

  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update hotel" }, { status: 500 });
  }
}