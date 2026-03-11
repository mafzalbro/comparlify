import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ platformId: string }> },
) {
  const { platformId } = await props.params;

  try {
    const platform = await prisma.platform.findUnique({
      where: { id: platformId },
      select: { website: true, name: true },
    });

    if (!platform) {
      return NextResponse.redirect(new URL("/compare", request.url));
    }

    // Log the click for analytics (fire-and-forget, non-blocking)
    prisma.affiliateClick
      .create({
        data: {
          platformId,
          referrer: request.headers.get("referer") ?? "direct",
          userAgent: request.headers.get("user-agent") ?? "",
          ip: request.headers.get("x-forwarded-for") ?? "unknown",
        },
      })
      .catch(console.error);

    return NextResponse.redirect(platform.website, { status: 302 });
  } catch (error) {
    console.error("[AFFILIATE REDIRECT ERROR]", error);
    return NextResponse.redirect(new URL("/compare", request.url));
  }
}
