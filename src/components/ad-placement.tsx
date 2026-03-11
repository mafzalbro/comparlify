// src/components/ad-placement.tsx
import Image from "next/image";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

interface Ad {
  id: string;
  type: "SCRIPT" | "IMAGE";
  content: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  allowedPages?: string | null; // Comma-separated list
}

interface AdPlacementProps {
  placement:
    | "HEADER"
    | "SIDEBAR"
    | "POST_TOP"
    | "POST_BOTTOM"
    | "COMPARISON_BETWEEN"
    | "MOBILE_FIXED_BOTTOM";
  className?: string;
}

/**
 * SERVER-SIDE AD PLACEMENT
 * This component fetches the ad directly from the database (Prisma) on the server.
 * This ensures no internal API keys or endpoints are exposed to the user.
 */
export async function AdPlacement({
  placement,
  className = "",
}: AdPlacementProps) {
  // 1. Fetch pathname from headers (populated by our middleware)
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";

  // 2. Fetch the ad directly on the server
  let ad: Ad | null = null;
  try {
    const data = await prisma.advertisement.findFirst({
      where: {
        placement: placement,
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Type casting/conversion if necessary (Prisma generated types)
    if (data) {
      ad = data as any as Ad;
    }
  } catch (error) {
    console.error("Server Ad Error:", error);
    return null;
  }

  if (!ad) return null;

  // 3. Page level filtering
  if (ad.allowedPages) {
    const pages = ad.allowedPages.split(",").map((p) => p.trim());
    const isAllowed = pages.some((p) => {
      if (p === "*") return true;
      if (p.endsWith("*")) {
        return pathname.startsWith(p.slice(0, -1));
      }
      return p === pathname;
    });

    if (!isAllowed) return null;
  }

  // 4. Render
  if (ad.type === "IMAGE" && ad.imageUrl) {
    const content = (
      <div
        className={`ad-placement ad-${placement.toLowerCase()} flex justify-center py-4 ${className}`}
      >
        <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group">
          <Image
            src={ad.imageUrl}
            alt="Advertisement"
            width={728}
            height={90}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-1 right-2 text-[10px] font-medium text-white bg-black/40 px-1.5 py-0.5 rounded-sm backdrop-blur-sm">
            AD
          </div>
        </div>
      </div>
    );
    return ad.linkUrl ? (
      <a
        href={ad.linkUrl}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className="block"
      >
        {content}
      </a>
    ) : (
      content
    );
  }

  return (
    <div
      className={`ad-placement ad-${placement.toLowerCase()} flex justify-center py-4 ${className}`}
      dangerouslySetInnerHTML={{ __html: ad.content }}
    />
  );
}
