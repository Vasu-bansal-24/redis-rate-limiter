// models/ThrottleEvent.js
import mongoose from "mongoose";

const ThrottleEventSchema = new mongoose.Schema({
  route: String,
  userId: String,
  ip: String,
  retryAfter: Number,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("ThrottleEvent", ThrottleEventSchema);