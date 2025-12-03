import { connectDB } from "@/lib/db";
import OrderV2 from "@/lib/models/Order";
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

    // Get orders (Populate generic fields if needed, simplified here)
    const orders = await OrderV2.find({
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
    // 1. Get Data, including new fields like 'customer' and 'paymentMethod'
    const { hotelId, deviceId, items, table, customer, paymentMethod, finalTotal } = await request.json();

    if (!hotelId || !deviceId || !items || !table) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Validate Hotel
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return NextResponse.json({ message: "Hotel not found" }, { status: 404 });
    }

    // 3. Check Table Limits (Prevent spam)
    const activeOrderCount = await OrderV2.countDocuments({
      hotelId,
      table,
      status: { $in: ["pending", "cooking", "served"] },
    });
    
    // Only check limit if we are creating a NEW order (not appending)
    // We check existence logic below, so this is a rough check.
    // Ideally, if an order exists, we ignore this limit. 
    
    // 4. Find Existing Active Order (for "Add to Order" feature)
    let order = await OrderV2.findOne({
      hotelId,
      deviceId,
      status: { $in: ["pending", "cooking", "served"] },
      paymentStatus: { $ne: "paid" } // Don't append to paid orders
    });

    if (order) {
      // --- APPEND MODE ---
      // Add new items to existing array
      order.items.push(...items);
    } else {
      // --- CREATE MODE ---
      if (activeOrderCount >= hotel.maxOrdersPerTable) {
        return NextResponse.json({ message: "Maximum orders for this table reached" }, { status: 429 });
      }

      order = new OrderV2({
        hotelId,
        deviceId,
        table,
        customer: {
          name: customer?.name || "Guest",
          contact: customer?.contact || ""
        },
        items: items, // Initial items
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: paymentMethod || "not-decide",
        additionalCharges: [] // Customer app usually doesn't add custom charges automatically yet
      });
    }

    // 5. RECALCULATE FINANCIALS (Crucial for new Schema)
    // A. Calculate Subtotal (Sum of all item prices)
    const subTotal = order.items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // C. Set Values
    order.subTotal = subTotal;
    order.total = finalTotal;

    await order.save();

    return NextResponse.json(order, { status: 201 });
  } catch (error:any) {
    console.error("Error creating order:", error);
    return NextResponse.json({ message: "Failed to create order", error:error?.message }, { status: 500 });
  }
}