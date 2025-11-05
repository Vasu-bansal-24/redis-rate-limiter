export const rateLimitConfig = {
  global: { windowSeconds: 60, maxRequests: 10 }, // fallback default

  routes: {
    "/api/resource": { windowSeconds: 60, maxRequests: 5 },
    "/api/expensive": { windowSeconds: 60, maxRequests: 2 },
  },
};
