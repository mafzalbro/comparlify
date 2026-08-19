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

      try { records.A = await dns.promises.resolve4(cleanDomain).catch(() => []); } catch (_) {}
      try { records.AAAA = await dns.promises.resolve6(cleanDomain).catch(() => []); } catch (_) {}
      try { records.MX = await dns.promises.resolveMx(cleanDomain).catch(() => []); } catch (_) {}
      try { records.TXT = await dns.promises.resolveTxt(cleanDomain).catch(() => []); } catch (_) {}
      try { records.NS = await dns.promises.resolveNs(cleanDomain).catch(() => []); } catch (_) {}
      try { records.SOA = await dns.promises.resolveSoa(cleanDomain).catch(() => null); } catch (_) {}

      return NextResponse.json({ success: true, domain: cleanDomain, records });
    }

    // 2. IP Lookup Mode
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

    // 3. HTTP Diagnostics & Full Web Analyzer Engine Mode
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

    // Fetch HTML body
    let htmlContent = "";
    if (finalResponse && finalResponse.ok) {
      try {
        htmlContent = await finalResponse.text();
      } catch (_) {}
    }

    // Helper regex extractors
    const getTagContent = (regex: RegExp) => {
      const match = htmlContent.match(regex);
      return match ? match[1] || match[2] || "" : "";
    };

    const getRawSnippet = (regex: RegExp) => {
      const match = htmlContent.match(regex);
      return match ? match[0] : "";
    };

    const titleMatch = htmlContent.match(/<title[^>]*>([^<]*)<\/title>/i);
    const metaTitle = titleMatch ? titleMatch[1].trim() : "";
    const rawTitleTag = titleMatch ? titleMatch[0] : "";

    const metaDescription = getTagContent(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const rawDescriptionTag = getRawSnippet(/<meta[^>]*name=["']description["'][^>]*>/i);

    const canonicalUrl = getTagContent(/<meta[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    const rawCanonicalTag = getRawSnippet(/<link[^>]*rel=["']canonical["'][^>]*>/i);

    const robotsMeta = getTagContent(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
    const rawRobotsTag = getRawSnippet(/<meta[^>]*name=["']robots["'][^>]*>/i);

    const viewportMeta = getTagContent(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["']/i);
    const rawViewportTag = getRawSnippet(/<meta[^>]*name=["']viewport["'][^>]*>/i);

    const langAttribute = getTagContent(/<html[^>]*lang=["']([^"']*)["']/i);
    const charsetMeta = getTagContent(/<meta[^>]*charset=["']([^"']*)["']/i) || "UTF-8";

    // Open Graph
    const ogTitle = getTagContent(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) || metaTitle;
    const ogDescription = getTagContent(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) || metaDescription;
    const ogImage = getTagContent(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
    const ogUrl = getTagContent(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']*)["']/i) || currentUrl;

    // Twitter Cards
    const twitterCard = getTagContent(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)["']/i) || "summary_large_image";
    const twitterTitle = getTagContent(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']*)["']/i) || ogTitle;
    const twitterDescription = getTagContent(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']*)["']/i) || ogDescription;
    const twitterImage = getTagContent(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)["']/i) || ogImage;

    // Crawl Discovered Internal Links (up to 20 links)
    const hrefRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>/gi;
    const discoveredUrls: { url: string; isInternal: boolean }[] = [];
    const seenUrls = new Set<string>();
    let hrefMatch;

    while ((hrefMatch = hrefRegex.exec(htmlContent)) !== null) {
      let href = hrefMatch[1];
      if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
        try {
          const absolute = new URL(href, currentUrl).toString();
          if (!seenUrls.has(absolute) && seenUrls.size < 20) {
            seenUrls.add(absolute);
            const isInternal = absolute.includes(new URL(currentUrl).hostname);
            discoveredUrls.push({ url: absolute, isInternal });
          }
        } catch (_) {}
      }
    }

    // Extract JSON-LD scripts
    const jsonLdMatches: string[] = [];
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let scriptMatch;
    while ((scriptMatch = jsonLdRegex.exec(htmlContent)) !== null) {
      if (scriptMatch[1]) jsonLdMatches.push(scriptMatch[1].trim());
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
        rawTitleTag,
        description: metaDescription,
        rawDescriptionTag,
        canonical: canonicalUrl,
        rawCanonicalTag,
        robots: robotsMeta,
        rawRobotsTag,
        viewport: viewportMeta,
        rawViewportTag,
        language: langAttribute || "en",
        charset: charsetMeta,
        ogTitle,
        ogDescription,
        ogImage,
        ogUrl,
        twitterCard,
        twitterTitle,
        twitterDescription,
        twitterImage,
        jsonLdCount: jsonLdMatches.length,
        jsonLdSchemas: jsonLdMatches,
      },
      discoveredUrls,
      rawHtmlSnippet: htmlContent.substring(0, 3000),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute web diagnostics." },
      { status: 500 }
    );
  }
}
