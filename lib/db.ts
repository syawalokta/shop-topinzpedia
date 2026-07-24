import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

/**
 * Cache koneksi di objek global agar tidak membuat koneksi baru
 * setiap kali hot-reload (dev) atau setiap invocation (serverless).
 */
const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};
global.mongooseCache = cached;

/** True bila MONGODB_URI diset. Jika false, data layer memakai fallback statis. */
export function isDbConfigured(): boolean {
  return Boolean(MONGODB_URI);
}

export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI belum diset. Tambahkan ke file .env.local — lihat .env.example."
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: process.env.MONGODB_DB ?? "topinzpedia",
        bufferCommands: false,
        serverSelectionTimeoutMS: 4000,
      })
      .catch((error) => {
        // Reset promise agar percobaan berikutnya bisa connect ulang
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
