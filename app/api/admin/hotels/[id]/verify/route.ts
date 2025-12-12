import { connectDB } from "@/lib/db"
import Hotel from "@/lib/models/Hotel"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params:  Promise<{ id: string }> }) {
  try {
    await connectDB()
    const hotel = await Hotel.findByIdAndUpdate((await params).id, { verified: true }, { new: true })

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 })
    }

    return NextResponse.json(hotel)
  } catch (error) {
    console.error("Error verifying hotel:", error)
    return NextResponse.json({ error: "Failed to verify hotel" }, { status: 500 })
  }
}
