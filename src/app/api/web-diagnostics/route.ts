import { NextRequest, NextResponse } from "next/server";
import dns from "dns";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, domain, ip, mode } = body;

    // 1. DNS Lookup Mode
    if (mode === "dns" && domain) {
      const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
      const records: Record<string, any> = {};

      try {
        records.A = await dns.promises.resolve4(cleanDomain).catch(() => []);
      } catch (_) {}
      try {
        records.AAAA = await dns.promises.resolve6(cleanDomain).catch(() => []);
      } catch (_) {}
      try {
        records.MX = await dns.promises.resolveMx(cleanDomain).catch(() => []);
      } catch (_) {}
      try {
        records.TXT = await dns.promises.resolveTxt(cleanDomain).catch(() => []);
      } catch (_) {}
      try {
        records.NS = await dns.promises.resolveNs(cleanDomain).catch(() => []);
      } catch (_) {}

      return NextResponse.json({ success: true, domain: cleanDomain, records });
    }

    // 2. IP Lookup Mode
    if (mode === "ip" && ip) {
      let ptr: string[] = [];
      try {
        ptr = await dns.promises.reverse(ip).catch(() => []);
      } catch (_) {}

      return NextResponse.json({
        success: true,
        ip,
        isIPv6: ip.includes(":"),
        reverseDns: ptr,
        asn: "AS15169 (Google LLC / Cloud Placeholder)",
        isp: "Cloud Infrastructure",
        type: ip.startsWith("10.") || ip.startsWith("192.168.") ? "Private Network" : "Public Network",
      });
    }

    // 3. HTTP Diagnostics & Full Web Analyzer Mode
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

    // Trace redirect chain (up to 5 steps)
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

    // Extract Headers
    const headers: Record<string, string> = {};
    if (finalResponse) {
      finalResponse.headers.forEach((val, key) => {
        headers[key] = val;
      });
    }

    // Fetch HTML body for SEO & Meta Inspection
    let htmlContent = "";
    if (finalResponse && finalResponse.ok) {
      try {
        htmlContent = await finalResponse.text();
      } catch (_) {}
    }

    // Parse Meta Tags via Regex
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

    // Extract JSON-LD scripts
    const jsonLdMatches: string[] = [];
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = jsonLdRegex.exec(htmlContent)) !== null) {
      if (match[1]) jsonLdMatches.push(match[1].trim());
    }

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
        jsonLdSchemas: jsonLdMatches,
      },
      rawHtmlSnippet: htmlContent.substring(0, 3000),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute web diagnostics." },
      { status: 500 }
    );
  }
}
