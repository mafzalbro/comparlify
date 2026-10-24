import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/api-auth";

// Helper to redirect to the 404 page
const redirectToNotFound = (request: Request) => {
  return NextResponse.redirect(new URL("/404", request.url));
};

/**
 * Proactive server-side protection for all API calls.
 * This route is ONLY accessible via a valid REST_API_KEY in the x-api-key header.
 * Browser access (even from admins) is blocked and redirected to 404.
 */
export async function GET(request: Request) {
  // 1. Block browser/unauthorized access with 404
  if (!isAuthorized(request)) {
    return redirectToNotFound(request);
  }

  // Hide sensitive API_KEY and other details from the user/client
  // All heavy data fetching should happen on the server

  return NextResponse.json({
    status: "ok",
    message: "Comparlify REST API is active and protected.",
    version: "1.0.0",
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
  // 1. Block browser/unauthorized access with 404
  if (!isAuthorized(request)) {
    return redirectToNotFound(request);
  }

  return NextResponse.json(
    { error: "Generic POST not supported at this endpoint" },
    { status: 405 },
  );
}