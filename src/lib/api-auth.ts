// src/lib/api-auth.ts
import { NextRequest } from "next/server";

/**
 * STRICT AUTHORIZATION
 * 1. Must be from SAME ORIGIN (verified via host vs origin/referer)
 * 2. OR must provide a valid X-API-KEY (for external server-to-server)
 * Direct browser address bar typing is BLOCKED.
 */
export function isAuthorized(req: Request) {
  const headers = req.headers;
  const origin = headers.get("origin");
  const referer = headers.get("referer");
  const host = headers.get("host"); // e.g., localhost:3000 or yourdomain.com
  const apiKey = headers.get("x-api-key");

  const serverApiKey = process.env.REST_API_KEY;

  // 1. API Key Check (for external/server calls)
  if (serverApiKey && apiKey === serverApiKey) {
    return true;
  }

  // 2. Strict Same-Origin Check
  // We require a host to be present, AND either an origin or referer that matches our host.
  if (host) {
    // Check Origin (sent by client-side fetch from the same origin)
    try {
      if (origin && new URL(origin).host === host) return true;
    } catch (e) {
      // Invalid origin URL, ignore
    }

    // Check Referer (fallback for some browsers/tools)
    // This allows our internal pages to call APIs but blocks direct URL bar typing.
    try {
      if (referer && new URL(referer).host === host) return true;
    } catch (e) {
      // Invalid referer URL, ignore
    }
  }

  // If we reach here, it means:
  // - No API key provided
  // - No Origin/Referer matching our host (e.g., typing in the browser bar)
  return false;
}
