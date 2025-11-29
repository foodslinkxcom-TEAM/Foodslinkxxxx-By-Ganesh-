import { connectDB } from "@/lib/db";
import Menu from "@/lib/models/menu";
import Order from "@/lib/models/Order";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const menu = await Menu.findById(id);

    if (menu) {
      return NextResponse.json(
        { success: false, message: "Menu not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: menu }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const connection = await connectDB();
  const session = await connection.startSession();
  session.startTransaction();

  const { id } = params;

    // Check if menu item exists and is not soft-deleted
    const menuItem = await Menu.findById(id).session(session);

  try {
    if (!menuItem) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, error: "ITEM_NOT_FOUND", message: "Menu item not found" },
        { status: 404 }
      );
    }

    // Check for active orders containing this menu item
    const activeOrders = await Order.find({
      "items.menuItemId": id,
      status: { $in: ["pending", "cooking", "served"] }
    }).session(session);

    if (activeOrders.length > 0) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, error: "CONFLICT", message: "Cannot delete item with active orders" },
        { status: 409 }
      );
    }

    // Soft delete the menu item
    await Menu.findByIdAndUpdate(id, { deleted_at: new Date() }, { session });

    await session.commitTransaction();
    return NextResponse.json(
      { success: true, message: "Menu item deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    await session.abortTransaction();
    const errorId = `MENU_DELETE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.error(`[${errorId}] Error deleting menu item:`, {
      error: error.message,
      stack: error.stack,
      menuId: id,
      hotelId: menuItem?.hotelId
    });
    return NextResponse.json(
      { success: false, error: "DB_CONSTRAINT", message: "Failed to delete menu item", errorId },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}