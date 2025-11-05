export const rateLimitConfig = {
  global: {
    window: 60, // seconds
    limit: 5,   // fallback if no route-specific limit
  },

  routes: {
    "/api/resource": {
      window: 60,
      limit: 5,
    },
    "/api/login": {
      window: 60,
      limit: 3,
    },
    "/api/data": {
      window: 120,
      limit: 10,
    },
  },
};

export default rateLimitConfig;
