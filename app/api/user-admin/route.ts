import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) return NextResponse.json({ error: "No DB connection" });

    // 1. Get current collections to ensure we have the name right
    const collections = await db.listCollections().toArray();
    const orderCollection = collections.find(c => c.name === 'orders');

    if (!orderCollection) {
       return NextResponse.json({ message: "Collection 'orders' does not exist yet. You are safe." });
    }

    // 2. FORCEFULLY remove the validator
    await db.command({
      collMod: "orders",
      validator: {}, // Set to empty object
      validationLevel: "off" // Turn it off completely
    });

    return NextResponse.json({ 
      success: true, 
      message: "FIXED: Old validation rules have been removed from 'orders' collection." 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}