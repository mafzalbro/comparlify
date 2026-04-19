export function parseUserAgent(ua: string) {
  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

  // Browser detection
  if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/")) browser = "Safari";
  else if (ua.includes("MSIE ") || ua.includes("Trident/")) browser = "Internet Explorer";

  // OS detection
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  // Device detection
  if (/mobile/i.test(ua)) device = "Mobile";
  if (/tablet/i.test(ua)) device = "Tablet";
  if (/ipad/i.test(ua)) device = "Tablet";

  return { browser, os, device };
}

export function getGeoData(headers: Headers) {
  return {
    country: headers.get("x-vercel-ip-country") || "Unknown",
    city: headers.get("x-vercel-ip-city") || "Unknown",
    region: headers.get("x-vercel-ip-country-region") || "Unknown",
  };
}
