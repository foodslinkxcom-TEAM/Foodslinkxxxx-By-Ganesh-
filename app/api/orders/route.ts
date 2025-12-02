import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import Hotel from "@/lib/models/Hotel";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get("hotelId");
    const deviceId = searchParams.get("deviceId");

    if (!hotelId || !deviceId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Get all orders for this device at the hotel
    const orders = await Order.find({
      hotelId,
      deviceId,
    }).sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { hotelId, deviceId, items, table } = await request.json();

    if (!hotelId || !deviceId || !items || !table) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Validate Hotel
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return NextResponse.json({ message: "Hotel not found" }, { status: 404 });
    }

    // 2. Check Table Order Limits
    const tableOrderCount = await Order.countDocuments({
      hotelId,
      table,
      status: { $in: ["pending", "cooking", "served"] },
    });
    if (tableOrderCount >= hotel.maxOrdersPerTable) {
      return NextResponse.json({ message: "Maximum orders for this table reached" }, { status: 429 });
    }

    // 3. Find or Create Order
    let order = await Order.findOne({
      hotelId,
      deviceId,
      status: { $in: ["pending", "cooking", "served"] },
    });

    if (order) {
      // Add items to the existing order
      order.items.push(...items);
    } else {
      // Create a new order
      order = new Order({
        hotelId,
        deviceId,
        table,
        items,
      });
    }

    // 4. Recalculate Total and Save
    order.total = order.items.reduce((sum: number, item: { price: number; quantity: number; }) => sum + item.price * item.quantity, 0);
    await order.save();

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
  }
}
