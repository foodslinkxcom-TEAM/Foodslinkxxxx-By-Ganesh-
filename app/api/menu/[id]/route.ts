import { connectDB } from "@/lib/db";
import Menu from "@/lib/models/menu";
import Order from "@/lib/models/Order";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// --- GET: Fetch Single Menu Item ---
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    const menu = await Menu.findById(id).populate("category");

    if (!menu) {
      return NextResponse.json(
        { success: false, message: "Menu item not found" },
        { status: 404 }
      );
    }

    // Determine the image source to return a consistent 'image' field
    const itemData = menu.toObject();
    itemData.image = itemData.imageFileUrl || itemData.imageUrl || itemData.image;

    return NextResponse.json(
      { success: true, item: itemData },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// --- PUT: Update Menu Item (Handles FormData for Edits) ---
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    // 1. Parse FormData (sent by the Edit Page)
    const formData = await request.formData();
    
    // 2. Construct Update Object
    const updateData: any = {};

    // Helper to safely get string values
    const getString = (key: string) => {
      const val = formData.get(key);
      return val ? String(val) : undefined;
    };

    if (formData.has("name")) updateData.name = getString("name");
    if (formData.has("description")) updateData.description = getString("description");
    if (formData.has("price")) updateData.price = parseFloat(getString("price") || "0");
    if (formData.has("category")) updateData.category = getString("category");
    if (formData.has("linkTarget")) updateData.linkTarget = getString("linkTarget");

    // Handle Boolean (FormData sends "true"/"false" as strings)
    if (formData.has("available")) {
      updateData.available = getString("available") === "true";
    }

    // 3. Handle Images
    // Case A: User provided an External URL
    const imageUrl = getString("imageUrl");
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
      // Clear file URL if switching to URL
      updateData.imageFileUrl = ""; 
    }

    // Case B: User uploaded a File
    const imageFile = formData.get("imageFile") as File | null;
    if (imageFile && imageFile.size > 0) {
      // TODO: IMPLEMENT FILE UPLOAD LOGIC HERE
      // 1. Upload `imageFile` to AWS S3 / Cloudinary / Uploadthing
      // 2. Get the resulting URL
      // 3. updateData.imageFileUrl = uploadedUrl;
      
      // For now, we log it. In a real app, you must integrate an upload provider.
      console.log("File received:", imageFile.name); 
      // updateData.imageFileUrl = "https://your-storage.com/" + imageFile.name; 
    }

    // 4. Update Database
    const updatedMenu = await Menu.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedMenu) {
      return NextResponse.json(
        { success: false, message: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Item updated successfully", data: updatedMenu },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update item" },
      { status: 500 }
    );
  }
}

// --- PATCH: Quick Update (e.g., Toggle Availability) ---
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    
    // Expecting JSON for PATCH (lighter weight than FormData)
    const body = await request.json();

    const updatedMenu = await Menu.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!updatedMenu) {
      return NextResponse.json(
        { success: false, message: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Status updated", data: updatedMenu },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// --- DELETE: Remove Item (With Safety Checks) ---
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Ensure DB is connected before starting session
  await connectDB();
  
  // Use mongoose.startSession() instead of connection.startSession() for reliability
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = params;

    // 1. Check if item exists
    const menuItem = await Menu.findById(id).session(session);

    if (!menuItem) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, error: "ITEM_NOT_FOUND", message: "Menu item not found" },
        { status: 404 }
      );
    }

    // 2. Check for active orders (pending/cooking/served)
    // We prevent deletion if the kitchen is currently processing this item
    const activeOrders = await Order.find({
      "items.menuItemId": id,
      status: { $in: ["pending", "cooking", "served"] }
    }).session(session);

    if (activeOrders.length > 0) {
      await session.abortTransaction();
      return NextResponse.json(
        { 
          success: false, 
          error: "CONFLICT", 
          message: `Cannot delete: Item is part of ${activeOrders.length} active order(s).` 
        },
        { status: 409 }
      );
    }

    // 3. Perform Delete
    // Option A: Hard Delete
    await Menu.findByIdAndDelete(id).session(session);
    
    // Option B: Soft Delete (Uncomment if you prefer this)
    // await Menu.findByIdAndUpdate(id, { deleted_at: new Date(), available: false }, { session });

    await session.commitTransaction();
    
    return NextResponse.json(
      { success: true, message: "Menu item deleted successfully" },
      { status: 200 }
    );

  } catch (error: any) {
    await session.abortTransaction();
    console.error("DELETE Error:", error);
    
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR", message: "Failed to delete menu item" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}