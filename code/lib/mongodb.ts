import mongoose from 'mongoose';

let mongoUri: string | undefined = process.env.MONGODB_URI;

export function setMongoUri(uri: string): void {
  mongoUri = uri;
}

interface MongooseCache {
  conn: mongoose.Mongoose | null;
  promise: Promise<mongoose.Mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (!mongoUri) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }
    const opts = { bufferCommands: false };

    cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
