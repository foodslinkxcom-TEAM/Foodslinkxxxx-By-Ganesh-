// /models/User.ts
import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  username: string
  email:string
  phone:string
  name:string
  passwordHash: string
  role: string
  hotelId?: string
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name:{ type: String },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true },
    hotelId: { type: String, default: null },
  },
  { timestamps: true },
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
