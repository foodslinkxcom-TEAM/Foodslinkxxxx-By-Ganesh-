import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Hotel from "@/lib/models/Hotel";
import { verifyToken, getAuthCookie } from "@/lib/auth";
import User from "@/lib/models/User";

// GET hotel details for verification
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const hotel = await Hotel.findById(params.id);
    const user = await User.findOne({hotelId:hotel._id});
    if (!hotel) return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    const data = {
      user,
      hotel,
    };
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch hotel" }, { status: 500 });
  }
}

// PATCH to update and verify hotel
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

// PUT to update hotel data
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await connectDB().startSession();
  session.startTransaction();

  try {
    const token = await getAuthCookie();
    if (!token) {
      await session.abortTransaction();
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      await session.abortTransaction();
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, address, latitude, longitude, upiId } = body;

    // Validation
    const errors: Record<string, string> = {};
    if (!name || name.trim().length < 2) errors.name = "Name must be at least 2 characters";
    if (!address || address.trim().length < 5) errors.address = "Address must be at least 5 characters";
    if (latitude !== undefined && (latitude < -90 || latitude > 90)) errors.latitude = "Invalid latitude";
    if (longitude !== undefined && (longitude < -180 || longitude > 180)) errors.longitude = "Invalid longitude";
    if (upiId && !upiId.includes('@')) errors.upiId = "Invalid UPI ID format";

    if (Object.keys(errors).length > 0) {
      await session.abortTransaction();
      return NextResponse.json({ errors }, { status: 400 });
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      params.id,
      { name: name.trim(), address: address.trim(), latitude, longitude, upiId: upiId?.trim() },
      { new: true, session, runValidators: true }
    );

    if (!updatedHotel) {
      await session.abortTransaction();
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    await session.commitTransaction();
    return NextResponse.json({ message: "Hotel updated successfully", hotel: updatedHotel });
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error updating hotel:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Duplicate entry" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update hotel" }, { status: 500 });
  } finally {
    session.endSession();
  }
}

// DELETE to reject/delete a hotel
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getAuthCookie();
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const deletedHotel = await Hotel.findByIdAndDelete(params.id);

    if (!deletedHotel) return NextResponse.json({ error: "Hotel not found" }, { status: 404 });

    return NextResponse.json({ message: "Hotel rejected and deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reject hotel" }, { status: 500 });
  }
}
