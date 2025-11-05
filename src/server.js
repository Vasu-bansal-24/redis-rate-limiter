import express from "express";
import { createClient } from "redis";
import crypto from "crypto";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectMongo from "./db.js";
import ThrottleEvent from "./models/ThrottleEvent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS for frontend
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Error:", err));
await redisClient.connect();

await connectMongo();

// ---- Rate Limit Config ----
const RATE_LIMIT = 5; // e.g. 5 requests per minute
const WINDOW_SIZE_IN_SECONDS = 60;

// ---- Middleware ----
// ---- Advanced Token Bucket Rate Limiter Factory ----
const createRateLimiter = (capacity, refillRate) => {
  return async (req, res, next) => {
    try {
      const userId = req.ip;
      const route = req.path;
      const key = `token_bucket:${route}:${userId}`;

      const now = Date.now();
      const bucketData = await redisClient.hGetAll(key);

      let tokens = parseFloat(bucketData.tokens ?? capacity);
      let lastRefill = parseInt(bucketData.lastRefill ?? now);

      // Refill tokens based on elapsed time
      const delta = (now - lastRefill) / 1000;
      const refill = delta * refillRate;
      tokens = Math.min(capacity, tokens + refill);

      if (tokens < 1) {
        const retryAfter = Math.ceil((1 - tokens) / refillRate);
        const resetTime = Math.ceil(now / 1000) + retryAfter; // Unix timestamp

        // Log throttle event to MongoDB
        await ThrottleEvent.create({
          route,
          userId,
          ip: req.ip,
          retryAfter,
        });
        
        res.set({
          "X-RateLimit-Limit": capacity.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": resetTime.toString(),
          "Retry-After": retryAfter.toString(),
        });
        return res.status(429).json({
          message: "Rate limit exceeded",
          retry_after_seconds: retryAfter,
        });
      }

      // Consume one token
      tokens -= 1;

      // Store updated values atomically
      await redisClient.hSet(key, {
        tokens: tokens.toFixed(3),
        lastRefill: now,
      });
      await redisClient.expire(key, 120); // 2-minute TTL

      const remaining = Math.floor(tokens);
      
      // Calculate time until bucket is full again
      const tokensNeeded = capacity - tokens;
      const secondsToFull = Math.ceil(tokensNeeded / refillRate);
      const resetTime = Math.ceil(now / 1000) + secondsToFull; // Unix timestamp
      
      res.set({
        "X-RateLimit-Limit": capacity.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": resetTime.toString(),
      });

      next();
    } catch (err) {
      console.error("Rate limiter error:", err);
      next(); // fail open
    }
  };
};

// Create different rate limiters for different endpoints
const standardLimiter = createRateLimiter(10, 5 / 60); // 10 capacity, 5 tokens/min
const strictLimiter = createRateLimiter(5, 3 / 60);    // 5 capacity, 3 tokens/min
const generousLimiter = createRateLimiter(20, 10 / 60); // 20 capacity, 10 tokens/min
const veryStrictLimiter = createRateLimiter(3, 2 / 60); // 3 capacity, 2 tokens/min

// ---- Routes ----
app.get("/healthz", (req, res) => res.send("OK"));

// Standard rate limit: 10 capacity, 5 tokens/min
app.get("/api/resource", standardLimiter, (req, res) => {
  const correlationId = crypto.randomUUID();
  res.json({
    message: "Success — under rate limit",
    correlationId,
    endpoint: "/api/resource",
    limits: "10 capacity, refills 5 tokens/minute"
  });
});

// Strict rate limit: 5 capacity, 3 tokens/min (good for login/auth)
app.get("/api/login", strictLimiter, (req, res) => {
  const correlationId = crypto.randomUUID();
  res.json({
    message: "Login successful",
    correlationId,
    endpoint: "/api/login",
    limits: "5 capacity, refills 3 tokens/minute (strict)"
  });
});

// Generous rate limit: 20 capacity, 10 tokens/min (good for data fetching)
app.get("/api/data", generousLimiter, (req, res) => {
  const correlationId = crypto.randomUUID();
  res.json({
    message: "Data retrieved successfully",
    correlationId,
    endpoint: "/api/data",
    limits: "20 capacity, refills 10 tokens/minute (generous)"
  });
});

// Very strict rate limit: 3 capacity, 2 tokens/min (expensive operations)
app.get("/api/expensive", veryStrictLimiter, (req, res) => {
  const correlationId = crypto.randomUUID();
  res.json({
    message: "Expensive operation completed",
    correlationId,
    endpoint: "/api/expensive",
    limits: "3 capacity, refills 2 tokens/minute (very strict)"
  });
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log("📊 Rate limits configured:");
  console.log("   - /api/resource: 10 capacity, 5 tokens/min (standard)");
  console.log("   - /api/login: 5 capacity, 3 tokens/min (strict)");
  console.log("   - /api/data: 20 capacity, 10 tokens/min (generous)");
  console.log("   - /api/expensive: 3 capacity, 2 tokens/min (very strict)");
});
