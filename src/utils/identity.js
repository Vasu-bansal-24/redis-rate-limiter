import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export function deriveIdentity(req) {
  // Normalize header casing
  const headers = Object.fromEntries(
    Object.entries(req.headers).map(([k, v]) => [k.toLowerCase(), v])
  );

  // 1️⃣ JWT auth
  const authHeader = headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.sub) {
        return { type: "jwt", id: decoded.sub };
      }
    } catch (err) {
      console.log("Invalid JWT:", err.message);
    }
  }

  // 2️⃣ API Key
  if (headers["x-api-key"]) {
    return { type: "apiKey", id: headers["x-api-key"] };
  }

  // 3️⃣ Fallback to IP
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    "unknown";
  return { type: "ip", id: ip };
}
