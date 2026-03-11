// src/app/api/rest/route.ts
import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/api-auth";

/**
 * Proactive server-side protection for all API calls.
 * This route is protected:
 *   - Allowed from own origin.
 *   - Allowed from other origins only if a valid REST_API_KEY is provided in x-api-key header.
 */
export async function GET(request: Request) {
  // Security is most important: protect this route
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  // Hide sensitive API_KEY and other details from the user/client
  // All heavy data fetching should happen on the server

  return NextResponse.json({
    status: "ok",
    message: "Comparlify REST API is active and protected.",
    version: "1.0.0",
    docs: "/api/docs", // assuming there might be docs
    endpoints: [
      "/api/rest/post",
      "/api/rest/comparison",
      "/api/rest/platform",
      "/api/rest/feature",
      "/api/rest/newsArticle",
      "/api/rest/forumTopic",
      "/api/rest/forumPost",
      "/api/rest/forumCategory",
      "/api/rest/comment",
      "/api/rest/tool",
      "/api/rest/advertisement",
    ],
  });
}

// Ensure security for other methods too
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  return NextResponse.json(
    { error: "Generic POST not supported at this endpoint" },
    { status: 405 },
  );
}
