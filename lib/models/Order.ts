import mongoose, { Schema, type Document } from "mongoose"

// 1. Interfaces
export interface IOrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  customization?: string
}

export interface IAdditionalCharge {
  label: string
  amount: number
  type: "fixed" | "percent"
}

export interface ICustomer {
  name: string
  contact?: string
}

export interface IOrder extends Document {
  hotelId: string
  table: string
  deviceId: string
  
  // -- Details --
  customer: ICustomer
  items: IOrderItem[]
  
  // -- Money --
  subTotal: number
  additionalCharges: IAdditionalCharge[]
  total: number
  
  // -- Status & Payment --
  status: "pending" | "cooking" | "served" | "paid" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed"
  paymentMethod: "cash" | "online" | "not-decide"
  
  // -- Legacy/Other --
  location?: {
    lat: number
    lon: number
    accuracy: number
    verified: boolean
    note?: string
  }
  requiresReview?: boolean
  createdAt: Date
  updatedAt: Date
}

// 2. Schema
const OrderSchema = new Schema<IOrder>(
  {
    hotelId: { type: String, required: true, index: true },
    table: { type: String, required: true },
    deviceId: { type: String, default: "dashboard" },

    // Customer Info
    customer: {
      name: { type: String, default: "Walk-in" },
      contact: { type: String, default: "" },
    },

    // Cart Items
    items: [
      {
        menuItemId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        customization: { type: String, default: "" },
      },
    ],

    // Financials
    subTotal: { type: Number, default: 0 },
    additionalCharges: [
      {
        label: { type: String },
        amount: { type: Number },
        type: { type: String, enum: ["fixed", "percent"] },
      }
    ],
    total: { type: Number, required: true },

    // States
    status: {
      type: String,
      enum: ["pending", "cooking", "served", "paid", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online","not-decide"],
      default: "not-decide",
    },

    // Location (Optional/Legacy)
    location: {
      lat: { type: Number },
      lon: { type: Number },
      accuracy: { type: Number },
      verified: { type: Boolean, default: false },
      note: { type: String },
    },
    requiresReview: { type: Boolean, default: false },
  },
  { timestamps: true },
)

// At the bottom of lib/models/Order.ts
export default mongoose.models.OrderV2 || mongoose.model<IOrder>("OrderV2", OrderSchema);