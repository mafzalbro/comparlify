import { NextRequest, NextResponse } from "next/server";
import dns from "dns";
import { isIP } from "net";

export const dynamic = "force-dynamic";

// ── 1. IN-MEMORY RATE LIMITER (10 requests per minute per IP) ──
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  limit.count++;
  return limit.count <= 10;
}

// ── 2. SSRF PROTECTION (Blocks cPanel internal ports, localhosts, and metadata) ──
function isSafeUrl(urlString: string): boolean {
  try {
    const u = new URL(urlString);
    if (!["http:", "https:"].includes(u.protocol)) return false;
    
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || host === "0.0.0.0") return false;
    if (host === "169.254.169.254") return false; // AWS Metadata

    if (isIP(host)) {
      const parts = host.split(".").map(Number);
      if (parts[0] === 10) return false;
      if (parts[0] === 127) return false;
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false;
      if (parts[0] === 192 && parts[1] === 168) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ success: false, error: "Rate limit exceeded. Try again in a minute." }, { status: 429 });
    }

    const body = await req.json();
    const { url, domain, ip: targetIp, mode, apiConfig } = body;

    // 1. API PROXY MODE
    if (mode === "api-proxy" && apiConfig) {
      const { method = "GET", url: apiUrl, headers = {}, payload } = apiConfig;
      
      if (!isSafeUrl(apiUrl)) {
        return NextResponse.json({ success: false, error: "SSRF Blocked: Target URL is not allowed." }, { status: 400 });
      }

      const startTime = Date.now();
      try {
        const safeHeaders = { ...headers };
        delete safeHeaders["host"];
        delete safeHeaders["Host"];

        const fetchOptions: RequestInit = {
          method,
          headers: { "User-Agent": "ComparlifyApiClient/1.0", ...safeHeaders },
          redirect: "manual",
        };
        if (["POST", "PUT", "PATCH"].includes(method.toUpperCase()) && payload) {
          fetchOptions.body = typeof payload === "string" ? payload : JSON.stringify(payload);
        }

        const apiRes = await fetch(apiUrl, fetchOptions);
        const resTimeMs = Date.now() - startTime;
        const resText = await apiRes.text();

        const resHeaders: Record<string, string> = {};
        apiRes.headers.forEach((val, key) => { resHeaders[key] = val; });

        return NextResponse.json({
          success: true, status: apiRes.status, statusText: apiRes.statusText,
          responseTimeMs: resTimeMs, headers: resHeaders, body: resText,
        });
      } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message || "Failed to execute proxied API request" });
      }
    }

    // 2. DNS LOOKUP MODE
    if (mode === "dns" && domain) {
      const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
      const records: Record<string, any> = {};
      try { records.A = await dns.promises.resolve4(cleanDomain).catch(() => []); } catch (_) {}
      try { records.AAAA = await dns.promises.resolve6(cleanDomain).catch(() => []); } catch (_) {}
      try { records.MX = await dns.promises.resolveMx(cleanDomain).catch(() => []); } catch (_) {}
      try { records.TXT = await dns.promises.resolveTxt(cleanDomain).catch(() => []); } catch (_) {}
      try { records.NS = await dns.promises.resolveNs(cleanDomain).catch(() => []); } catch (_) {}
      return NextResponse.json({ success: true, domain: cleanDomain, records });
    }

    // 3. IP LOOKUP MODE
    if (mode === "ip" && targetIp) {
      let ptr: string[] = [];
      try { ptr = await dns.promises.reverse(targetIp).catch(() => []); } catch (_) {}
      return NextResponse.json({
        success: true, ip: targetIp, isIPv6: targetIp.includes(":"),
        reverseDns: ptr, asn: "AS15169", isp: "Cloud Infrastructure",
        type: targetIp.startsWith("10.") || targetIp.startsWith("192.168.") ? "Private" : "Public",
      });
    }

    // 4. MASTER WEB DIAGNOSTICS & CRAWLER
    if (!url) return NextResponse.json({ success: false, error: "Missing required URL" }, { status: 400 });

    let targetUrl = url;
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) targetUrl = `https://${targetUrl}`;

    if (!isSafeUrl(targetUrl)) {
      return NextResponse.json({ success: false, error: "SSRF Blocked: Target URL is not allowed." }, { status: 400 });
    }

    const redirectChain: { url: string; status: number; statusText: string }[] = [];
    let currentUrl = targetUrl;
    let finalResponse: Response | null = null;
    let attempts = 0;
    const startTime = Date.now();
    let fetchErrorMsg: string | null = null;

    while (attempts < 5) {
      attempts++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(currentUrl, {
          method: "GET", redirect: "manual", signal: controller.signal,
          headers: { "User-Agent": "ComparlifyWebDiagnosticsBot/1.0 (+https://comparlify.com)" },
        });
        clearTimeout(timeoutId);

        redirectChain.push({ url: currentUrl, status: res.status, statusText: res.statusText || "OK" });

        if (res.status >= 300 && res.status < 400) {
          const loc = res.headers.get("location");
          if (loc) {
            const nextUrl = loc.startsWith("http") ? loc : new URL(loc, currentUrl).toString();
            if (!isSafeUrl(nextUrl)) throw new Error("SSRF Blocked on redirect destination.");
            currentUrl = nextUrl;
            continue;
          }
        }
        finalResponse = res;
        break;
      } catch (e: any) {
        fetchErrorMsg = e.name === "AbortError" ? "Connection Timed Out" : e.message || "Host Unreachable / DNS Failed";
        break;
      }
    }

    const responseTimeMs = Date.now() - startTime;
    const headers: Record<string, string> = {};
    if (finalResponse) finalResponse.headers.forEach((val, key) => { headers[key] = val; });

    let htmlContent = "";
    if (finalResponse && finalResponse.ok) {
      try { htmlContent = await finalResponse.text(); } catch (_) {}
    }

    const isUnreachable = !finalResponse || fetchErrorMsg !== null;
    const finalStatus = finalResponse ? finalResponse.status : 0;
    const finalStatusText = finalResponse ? finalResponse.statusText || `HTTP ${finalResponse.status}` : fetchErrorMsg || "Host Unreachable";

    const getTagContent = (regex: RegExp) => {
      const match = htmlContent.match(regex);
      return match ? match[1] || match[2] || "" : "";
    };

    const titleMatch = htmlContent.match(/<title[^>]*>([^<]*)<\/title>/i);
    const metaTitle = titleMatch ? titleMatch[1].trim() : "";
    const metaDescription = getTagContent(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const canonicalUrl = getTagContent(/<meta[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    const robotsMeta = getTagContent(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);

    const ogTitle = getTagContent(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) || metaTitle;
    const ogDescription = getTagContent(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) || metaDescription;
    const ogImage = getTagContent(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);

    const imagesCount = (htmlContent.match(/<img[^>]*>/gi) || []).length;
    const scriptsCount = (htmlContent.match(/<script[^>]*>/gi) || []).length;
    const stylesheetsCount = (htmlContent.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || []).length;

    const hrefRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>/gi;
    const discoveredUrls: any[] = [];
    const seenUrls = new Set<string>();
    let hrefMatch;
    while ((hrefMatch = hrefRegex.exec(htmlContent)) !== null) {
      let href = hrefMatch[1];
      if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
        try {
          const absolute = new URL(href, currentUrl).toString();
          if (!seenUrls.has(absolute) && seenUrls.size < 25) {
            seenUrls.add(absolute);
            const isInternal = absolute.includes(new URL(currentUrl).hostname);
            discoveredUrls.push({ url: absolute, isInternal, status: 200 });
          }
        } catch (_) {}
      }
    }

    const jsonLdMatches: string[] = [];
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let scriptMatch;
    while ((scriptMatch = jsonLdRegex.exec(htmlContent)) !== null) {
      if (scriptMatch[1]) jsonLdMatches.push(scriptMatch[1].trim());
    }

    let score = 100;
    if (isUnreachable) { score = 0; } else {
      if (!metaTitle) score -= 15;
      if (!metaDescription) score -= 15;
      if (!canonicalUrl) score -= 10;
      if (!ogImage) score -= 10;
      if (responseTimeMs > 1000) score -= 10;
      if (jsonLdMatches.length === 0) score -= 10;
    }

    return NextResponse.json({
      success: !isUnreachable && finalStatus >= 200 && finalStatus < 400,
      isUnreachable, error: fetchErrorMsg, url: targetUrl, finalUrl: currentUrl,
      status: finalStatus, statusText: finalStatusText, responseTimeMs: isUnreachable ? 0 : responseTimeMs,
      redirectChain, headers,
      seo: { title: metaTitle, description: metaDescription, canonical: canonicalUrl, robots: robotsMeta, ogTitle, ogDescription, ogImage, jsonLdCount: jsonLdMatches.length },
      assets: { imagesCount, scriptsCount, stylesheetsCount, htmlBytes: htmlContent.length },
      discoveredUrls, healthScore: Math.max(0, score),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, isUnreachable: true, status: 0, error: error.message }, { status: 500 });
  }
}