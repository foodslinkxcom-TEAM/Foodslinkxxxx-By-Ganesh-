import mongoose, { Schema, type Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: { 
      type: String, 
      required: true,
      index: true 
    },
    otp: { 
      type: String, 
      required: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now, 
      expires: 300 // ⚠️ CRITICAL: Doc automatically deletes after 300 seconds (5 mins)
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

export default mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);