import { connectDB } from "@/lib/db"
import Order from "@/lib/models/Order"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params:Promise< { id: string }> }) {
  try {
    await connectDB()
    const order = await Order.findById((await params).id)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params:Promise<{ id: string }> }) {
  try {
    await connectDB()
    const data = await request.json()

    const order = await Order.findByIdAndUpdate((await params).id, data, { new: true })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }


    return NextResponse.json(order)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    await Order.findByIdAndDelete((await params).id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}
