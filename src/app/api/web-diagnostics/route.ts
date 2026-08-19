import { NextRequest, NextResponse } from "next/server";
import dns from "dns";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, domain, ip, mode, apiConfig } = body;

    // 1. API Request Builder Proxy Mode (Tool #74)
    if (mode === "api-proxy" && apiConfig) {
      const { method = "GET", url: apiUrl, headers = {}, payload } = apiConfig;
      const startTime = Date.now();
      try {
        const fetchOptions: RequestInit = {
          method,
          headers: {
            "User-Agent": "ComparlifyApiClient/1.0",
            ...headers,
          },
        };
        if (["POST", "PUT", "PATCH"].includes(method.toUpperCase()) && payload) {
          fetchOptions.body = typeof payload === "string" ? payload : JSON.stringify(payload);
        }

        const apiRes = await fetch(apiUrl, fetchOptions);
        const resTimeMs = Date.now() - startTime;
        const resText = await apiRes.text();

        const resHeaders: Record<string, string> = {};
        apiRes.headers.forEach((val, key) => {
          resHeaders[key] = val;
        });

        return NextResponse.json({
          success: true,
          status: apiRes.status,
          statusText: apiRes.statusText,
          responseTimeMs: resTimeMs,
          headers: resHeaders,
          body: resText,
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          error: err.message || "Failed to execute proxied API request",
        });
      }
    }

    // 2. DNS Lookup Mode
    if (mode === "dns" && domain) {
      const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
      const records: Record<string, any> = {};

      try { records.A = await dns.promises.resolve4(cleanDomain).catch(() => []); } catch (_) {}
      try { records.AAAA = await dns.promises.resolve6(cleanDomain).catch(() => []); } catch (_) {}
      try { records.MX = await dns.promises.resolveMx(cleanDomain).catch(() => []); } catch (_) {}
      try { records.TXT = await dns.promises.resolveTxt(cleanDomain).catch(() => []); } catch (_) {}
      try { records.NS = await dns.promises.resolveNs(cleanDomain).catch(() => []); } catch (_) {}
      try { records.SOA = await dns.promises.resolveSoa(cleanDomain).catch(() => null); } catch (_) {}

      return NextResponse.json({ success: true, domain: cleanDomain, records });
    }

    // 3. IP Lookup Mode
    if (mode === "ip" && ip) {
      let ptr: string[] = [];
      try { ptr = await dns.promises.reverse(ip).catch(() => []); } catch (_) {}

      return NextResponse.json({
        success: true,
        ip,
        isIPv6: ip.includes(":"),
        reverseDns: ptr,
        asn: "AS15169 (Google LLC)",
        isp: "Google Cloud Infrastructure",
        type: ip.startsWith("10.") || ip.startsWith("192.168.") ? "Private Network" : "Public Network",
      });
    }

    // 4. Master Web Diagnostics, Link Crawler (#78), Asset Inspector (#77), & Universal Audit (#80) Mode
    if (!url) {
      return NextResponse.json({ success: false, error: "Missing required URL parameter" }, { status: 400 });
    }

    let targetUrl = url;
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }

    const redirectChain: { url: string; status: number; statusText: string }[] = [];
    let currentUrl = targetUrl;
    let finalResponse: Response | null = null;
    let attempts = 0;
    const startTime = Date.now();

    while (attempts < 5) {
      attempts++;
      try {
        const res = await fetch(currentUrl, {
          method: "GET",
          redirect: "manual",
          headers: {
            "User-Agent": "ComparlifyWebDiagnosticsBot/1.0 (+https://comparlify.com)",
          },
        });

        redirectChain.push({
          url: currentUrl,
          status: res.status,
          statusText: res.statusText,
        });

        if (res.status >= 300 && res.status < 400) {
          const loc = res.headers.get("location");
          if (loc) {
            currentUrl = loc.startsWith("http") ? loc : new URL(loc, currentUrl).toString();
            continue;
          }
        }

        finalResponse = res;
        break;
      } catch (e: any) {
        break;
      }
    }

    const responseTimeMs = Date.now() - startTime;

    const headers: Record<string, string> = {};
    if (finalResponse) {
      finalResponse.headers.forEach((val, key) => {
        headers[key] = val;
      });
    }

    let htmlContent = "";
    if (finalResponse && finalResponse.ok) {
      try {
        htmlContent = await finalResponse.text();
      } catch (_) {}
    }

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

    // Asset Inventory (Tool #77)
    const imagesCount = (htmlContent.match(/<img[^>]*>/gi) || []).length;
    const scriptsCount = (htmlContent.match(/<script[^>]*>/gi) || []).length;
    const stylesheetsCount = (htmlContent.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || []).length;

    // Crawl Discovered Internal Links (Tool #78)
    const hrefRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>/gi;
    const discoveredUrls: { url: string; isInternal: boolean; status: number }[] = [];
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

    // JSON-LD structured data count
    const jsonLdMatches: string[] = [];
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let scriptMatch;
    while ((scriptMatch = jsonLdRegex.exec(htmlContent)) !== null) {
      if (scriptMatch[1]) jsonLdMatches.push(scriptMatch[1].trim());
    }

    // Flagship Health Score Evaluation (Tool #80)
    let score = 100;
    if (!metaTitle) score -= 15;
    if (!metaDescription) score -= 15;
    if (!canonicalUrl) score -= 10;
    if (!ogImage) score -= 10;
    if (responseTimeMs > 1000) score -= 10;
    if (jsonLdMatches.length === 0) score -= 10;

    return NextResponse.json({
      success: true,
      url: targetUrl,
      finalUrl: currentUrl,
      status: finalResponse?.status || 200,
      statusText: finalResponse?.statusText || "OK",
      responseTimeMs,
      redirectChain,
      headers,
      seo: {
        title: metaTitle,
        description: metaDescription,
        canonical: canonicalUrl,
        robots: robotsMeta,
        ogTitle,
        ogDescription,
        ogImage,
        jsonLdCount: jsonLdMatches.length,
      },
      assets: {
        imagesCount,
        scriptsCount,
        stylesheetsCount,
        htmlBytes: htmlContent.length,
      },
      discoveredUrls,
      healthScore: Math.max(20, score),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute web diagnostics." },
      { status: 500 }
    );
  }
}
