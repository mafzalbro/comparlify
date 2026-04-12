import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseUserAgent, getGeoData } from "@/lib/analytics-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platformId: string }> },
) {
  const { platformId } = await params;

  try {
    const platform = await prisma.platform.findUnique({
      where: { id: platformId },
      select: { website: true },
    });

    if (!platform) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Capture Analytics
    const referrer = request.headers.get("referer") || "direct";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    const { browser, os, device } = parseUserAgent(userAgent);
    const { country, city, region } = getGeoData(request.headers);

    await prisma.affiliateClick.create({
      data: {
        platformId,
        referrer,
        userAgent,
        ip,
        browser,
        os,
        device,
        country,
        city,
        region,
      },
    });

    // Strategy: Use a 302 redirect for real-time tracking
    return NextResponse.redirect(new URL(platform.website, request.url));
  } catch (error) {
    console.error("Affiliate tracking error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
