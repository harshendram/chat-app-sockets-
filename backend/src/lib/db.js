import mongoose from "mongoose";

export const connectToDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB is connected: ${conn.connection.host}`);
  } catch (e) {
    console.log("MongoDB connection is error:", e);
  }
};
