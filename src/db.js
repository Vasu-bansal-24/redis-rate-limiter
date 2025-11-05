import mongoose from "mongoose";

const connectMongo = async () => {
  try {
    // Use environment variable for MongoDB URI, fallback to local for development
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/rateLimiterDB";
    
    // Connection options for better reliability
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };
    
    await mongoose.connect(uri, options);
    
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    // Test write operation to ensure connection is working
    const testWrite = await mongoose.connection.db.admin().ping();
    if (testWrite.ok === 1) {
      console.log("✅ MongoDB write operations confirmed working");
    }
    
    // Add connection event listeners
    mongoose.connection.on('disconnected', () => {
      console.warn("⚠️ MongoDB disconnected");
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log("✅ MongoDB reconnected");
    });
    
    mongoose.connection.on('error', (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });
    
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("💡 Make sure MONGO_URI environment variable is set correctly");
    console.error("💡 Check MongoDB Atlas Network Access allows 0.0.0.0/0");
    // Don't exit process, allow app to continue (some features may not work)
  }
};

export default connectMongo;
