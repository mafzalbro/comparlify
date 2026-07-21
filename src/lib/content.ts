"use server";
import "server-only";
import { cache } from "react";
import prisma from "./prisma";

// Global cache objects for persistent in-memory caching across requests
let cachedContent: Record<string, string> | null = null;
let cachedContentTime = 0;
const CACHE_TTL = 30000; // 30 seconds cache TTL

export const getContent = cache(async () => {
  const now = Date.now();
  if (cachedContent && now - cachedContentTime < CACHE_TTL) {
    return cachedContent;
  }

  try {
    const allContent = await prisma.siteContent.findMany();
    const contentMap = allContent.reduce((acc: Record<string, string>, item: { key: string; value: string }) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);

    cachedContent = contentMap;
    cachedContentTime = now;
    return contentMap;
  } catch (error) {
    console.error("Error fetching site content:", error);
    if (cachedContent) {
      return cachedContent;
    }
    return {};
  }
});

let cachedSiteName: string | null = null;
let cachedSiteNameTime = 0;

export const getSiteName = cache(async () => {
  const now = Date.now();
  if (cachedSiteName !== null && now - cachedSiteNameTime < CACHE_TTL) {
    return cachedSiteName;
  }

  try {
    const value = (await prisma.siteContent.findUnique({ where: { key: "global.siteName" } }))?.value || "";
    cachedSiteName = value;
    cachedSiteNameTime = now;
    return value;
  } catch (error) {
    console.error("Error fetching site name:", error);
    if (cachedSiteName !== null) {
      return cachedSiteName;
    }
    return "";
  }
});

export async function clearContentCache() {
  cachedContent = null;
  cachedContentTime = 0;
  cachedSiteName = null;
  cachedSiteNameTime = 0;
}
