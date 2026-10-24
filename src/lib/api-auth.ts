// src/lib/api-auth.ts
import crypto from "crypto";

function safeCompare(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function isAuthorized(req: Request): boolean {
  const apiKey = req.headers.get("x-api-key");
  const serverApiKey = process.env.REST_API_KEY;

  if (!serverApiKey || !apiKey) return false;
  return safeCompare(apiKey, serverApiKey);
}