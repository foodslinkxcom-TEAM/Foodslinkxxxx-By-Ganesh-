import { connectDB } from "@/lib/db"
import OrderV2 from "@/lib/models/Order"
import { type NextRequest, NextResponse } from "next/server"

// GET: Fetch all orders for the hotel
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const orders = await OrderV2.find({ hotelId: id }).sort({ createdAt: -1 })
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

// POST: Create a new detailed Invoice/Order
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()
    
    // Destructure all the new fields sent from the frontend
    const { 
      items, 
      table = "Counter", 
      customer,          // { name, contact }
      additionalCharges, // [{ label, amount, type }]
      subTotal,
      total,
      paymentMethod,     // 'cash' | 'online'
      status,            // Payment Status ('paid' | 'pending')
      orderStatus        // Order Workflow ('served' | 'paid' | 'placed')
    } = body

    // Basic Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 })
    }

    // Use total from frontend (includes custom charges) or fallback to basic sum
    const finalTotal = total || items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)

    const newOrder = new OrderV2({
      hotelId: id,
      table,
      // Save Customer Details
      customer: {
        name: customer?.name || "Walk-in",
        contact: customer?.contact || ""
      },
      items,
      // Save Financial Breakdown
      subTotal: subTotal || 0,
      additionalCharges: additionalCharges || [],
      total: finalTotal,
      // Save Status & Payment Info
      paymentMethod: paymentMethod || "not-decide",
      paymentStatus: status || "pending", // 'status' from frontend is payment status
      status: orderStatus || "placed",    // 'orderStatus' from frontend is workflow status
      
      deviceId: "dashboard",
      createdAt: new Date()
    })

    await newOrder.save()
    
    return NextResponse.json(newOrder, { status: 201 })
  } catch (error: any) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Failed to create order", details: error.message }, 
      { status: 500 }
    )
  }
}