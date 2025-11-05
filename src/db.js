import mongoose from "mongoose";

const connectMongo = async () => {
  try {
    const uri = "mongodb://localhost:27017/rateLimiterDB"; // default local URI
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
};

export default connectMongo;
