import Redis from "ioredis";
import mongoose from "mongoose";
import ThrottleEvent from "../models/ThrottleEvent.js"; 
import { deriveIdentity } from "../utils/identity.js";
import rateLimitConfig from "../config/rateLimits.js";

const redis = new Redis({
  host: "host.docker.internal",
  port: 6379,
});


// Note: Removed the 'options' parameter as the config is loaded from rateLimitConfig.js
export const createRateLimiter = (route) => {

  return async (req, res, next) => {
    try {
      // STEP 1: Identify the user
      const identity = deriveIdentity(req);
      const userId = identity.id;

      // STEP 2: Load Route-Specific Configuration
      // Use the route passed to createRateLimiter, fall back to global if no specific config exists
      console.log("🔹 Route:", route);
      const config = rateLimitConfig.routes[route] || rateLimitConfig.global;

      // Use the config values consistently
      const windowInSeconds = config.window; 
      const maxRequests = config.limit;

      // Build the Redis key
      const redisKey = `rate_limit:${route}:${identity.type}:${userId}`;
      
      // STEP 3: Increment request count (Atomic Operation)
      const requests = await redis.incr(redisKey);

      if (requests === 1) {
        // First request: set expiration window
        await redis.expire(redisKey, windowInSeconds); // Use windowInSeconds from config
      }

      // STEP 4: Check limit
      if (requests > maxRequests) {
        const ttl = await redis.ttl(redisKey); // Get how many seconds until reset

        // Log throttle event in MongoDB
        await ThrottleEvent.create({
          route,
          userId,
          ip: req.ip,
          retryAfter: ttl,
        });

        // Send 429 response
        return res.status(429).json({
          message: "Rate limit exceeded",
          retry_after_seconds: ttl,
        });
      }

      // STEP 5: Add Rate Limit Headers and Proceed
      const ttl = await redis.ttl(redisKey); // Corrected 'key' to 'redisKey'

      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - requests));
      // X-RateLimit-Reset should be a Unix timestamp (seconds) or absolute date/time
      // For simplicity, using a millisecond timestamp
      res.setHeader("X-RateLimit-Reset", Date.now() + ttl * 1000); 

      next();
    } catch (err) {
      console.error("Rate limiter error:", err);
      // Fail open (default behavior): allow request if limiter fails
      // next() // Uncomment this if you want to fail open
      res.status(500).json({ message: "Internal rate limiter error" });
    }
  };
};