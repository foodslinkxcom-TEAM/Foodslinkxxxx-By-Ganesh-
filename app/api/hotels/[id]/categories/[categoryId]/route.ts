import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; categoryId: string }> }) {
  try {
    await connectDB();
    const { id: hotelId, categoryId } = params;

    // Check if category exists and belongs to the hotel
    const category = await Category.findOne({ _id: categoryId, hotelId });
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    // Delete the category
    await Category.findByIdAndDelete(categoryId);

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ message: "Failed to delete category" }, { status: 500 });
  }
}