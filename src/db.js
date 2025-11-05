import mongoose from "mongoose";

const connectMongo = async () => {
  try {
    // Use environment variable for MongoDB URI, fallback to local for development
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/rateLimiterDB";
    
    await mongoose.connect(uri);
    
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("💡 Make sure MONGO_URI environment variable is set correctly");
    // Don't exit process, allow app to continue (some features may not work)
  }
};

export default connectMongo;
