import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://root:root@foodslinkx.acsjpy1.mongodb.net/?retryWrites=true&w=majority&appName=FoodsLinkX";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * - It uses a cached connection to avoid creating multiple connections in a serverless environment.
 * - If a connection already exists, it returns the cached connection.
 * - Otherwise, it creates a new connection and caches it for future use.
 *
 * @returns {Promise<any>} A promise that resolves to the Mongoose connection object.
 * @throws {Error} If the database connection fails.
 */
export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}
