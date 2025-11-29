
import { connectDB } from "@/lib/db";
import Hotel from "@/lib/models/Hotel";
import Menu from "@/lib/models/menu";
import Order from "@/lib/models/Order";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string, menuId: string }> }) {
  try {
    await connectDB();
    const { id: hotelId, menuId } = await params;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    if (!hotel.menu.includes(menuId)) {
      return NextResponse.json({ error: "Menu item not found in this hotel" }, { status: 404 });
    }

    const menuItem = await Menu.findOne({_id: menuId, deleted_at: { $exists: false }});

    if (!menuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    return NextResponse.json({ error: "Failed to fetch menu item" }, { status: 500 });
  }
}


export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string, menuId: string }> }) {
  try {
    await connectDB();
    const { id: hotelId, menuId } = await params;
    const data = await request.json();

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    const menuItem = await Menu.findOne({ _id: menuId, hotelId, deleted_at: { $exists: false } });
    if (!menuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    const updatedMenu = await Menu.findByIdAndUpdate(menuId, data, { new: true });

    if (!updatedMenu) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json(updatedMenu);
  } catch (error) {
    console.error("Error updating menu item:", error);
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string, menuId: string }> }) {
  try {
    await connectDB();
    const { id: hotelId, menuId } = await params;
    const { available } = await request.json();

    if (typeof available !== 'boolean') {
      return NextResponse.json({ error: "Invalid 'available' status" }, { status: 400 });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    // First try to update in Menu collection
    const menuItem = await Menu.findOne({ _id: menuId, hotelId, deleted_at: { $exists: false } });
    if (menuItem) {
      const updatedMenu = await Menu.findByIdAndUpdate(menuId, { available }, { new: true });
      if (!updatedMenu) {
        return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
      }
      return NextResponse.json(updatedMenu);
    }

    // If not in Menu collection, try to update in hotel.menu array
    const updatedHotel = await Hotel.findOneAndUpdate(
      { _id: hotelId, 'menu._id': menuId },
      { $set: { 'menu.$.available': available } },
      { new: true }
    );

    if (!updatedHotel) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    // Return the updated menu item from hotel.menu
    const updatedItem = updatedHotel.menu.find((item: any) => item._id.toString() === menuId);
    if (!updatedItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating menu item availability:", error);
    return NextResponse.json({ error: "Failed to update menu item availability" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; menuId: string }> }
) {
  const { id: hotelId, menuId } = await params;
  
  // 1. Database Connection
  const connection = await connectDB();
  const session = await connection.startSession();
  session.startTransaction();

  try {
  

    // 3. Find Hotel
    const hotel = await Hotel.findById(hotelId).session(session);
    if (!hotel) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, error: "ITEM_NOT_FOUND", message: "Hotel not found" },
        { status: 404 }
      );
    }

    // 4. Find Menu Item (Ensure not already deleted)
    const menuItem = await Menu.findOne({ 
      _id: menuId, 
      hotelId,
      deleted_at: { $exists: false } 
    }).session(session);

    if (!menuItem) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, error: "ITEM_NOT_FOUND", message: "Menu item not found or already deleted" },
        { status: 404 }
      );
    }

    // 5. Conflict Check: Active Orders
    const activeOrders = await Order.find({
      "items.menuItemId": menuId,
      status: { $in: ["pending", "cooking", "served"] }, // 'served' items might still be unpaid/active on table
    }).session(session);

    if (activeOrders.length > 0) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, error: "CONFLICT", message: `Cannot delete: Item exists in ${activeOrders.length} active order(s)` },
        { status: 409 }
      );
    }

    // 6. Soft Delete the Menu Item
    await Menu.findByIdAndUpdate(
      menuId, 
      { deleted_at: new Date() }, 
      { session }
    );

    // 7. Remove Reference from Hotel
    // Note: This works if 'hotel.menu' is an array of IDs. 
    // If it is an array of objects, this step requires a migration first.
    await Hotel.findByIdAndUpdate(
      hotelId,
      { $pull: { menu: menuId } },
      { session }
    );

    // 8. Commit Transaction
    await session.commitTransaction();
    
    return NextResponse.json({ 
      success: true, 
      message: "Menu item deleted successfully" 
    }, { status: 200 });

  } catch (error: any) {
    await session.abortTransaction();
    console.error("DELETE Menu Error:", error);

    const isInvalidId = error.message === "INVALID_ID";
    
    return NextResponse.json(
      { 
        success: false, 
        error: isInvalidId ? "BAD_REQUEST" : "DB_ERROR", 
        message: isInvalidId ? "Invalid Hotel or Menu ID format" : "Failed to delete menu item" 
      },
      { status: isInvalidId ? 400 : 500 }
    );
  } finally {
    session.endSession();
  }
}