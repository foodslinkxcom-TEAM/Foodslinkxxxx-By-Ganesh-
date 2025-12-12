import { connectDB } from "@/lib/db"
import Order from "@/lib/models/Order"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    
    // 1. Read the data sent from the frontend
    const body = await request.json() 
    const { paymentMethod, status } = body

    // 2. Update both status and paymentMethod
    const order = await Order.findByIdAndUpdate(
      (await params).id, 
      { 
        status: status || "paid", 
        paymentStatus:status || "paid", 
        paymentMethod: paymentMethod // Uses the value from request
      }, 
      { new: true }
    )

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error marking order as paid:", error)
    return NextResponse.json({ error: "Failed to mark order as paid" }, { status: 500 })
  }
}