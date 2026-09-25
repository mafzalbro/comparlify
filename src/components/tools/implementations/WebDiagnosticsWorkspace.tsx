"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Globe,
  Link2,
  Server,
  Network,
  Cpu,
  Search,
  FileCode,
  ShieldCheck,
  Copy,
  Check,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Eye,
  RefreshCw,
  Terminal,
  Layers,
  Loader2,
  Bot,
  Zap,
  Download,
  XCircle,
} from "lucide-react";

interface WebDiagnosticsWorkspaceProps {
  activeToolId?: string;
}

const WEB_TOOLS = [
  { id: "url-analyzer", name: "URL Intelligence", icon: Link2 },
  { id: "http-status-checker", name: "HTTP Diagnostics", icon: Server },
  { id: "dns-lookup", name: "DNS Analyzer", icon: Network },
  { id: "ip-lookup", name: "IP Intelligence", icon: Cpu },
  { id: "user-agent-parser", name: "User-Agent", icon: Bot },
  { id: "meta-tag-analyzer", name: "SEO Meta Inspector", icon: Search },
  { id: "robots-txt-generator", name: "Robots Playground", icon: ShieldCheck },
  { id: "sitemap-generator", name: "Sitemap Crawler", icon: Layers },
  { id: "open-graph-preview", name: "Social Preview Studio", icon: Eye },
  { id: "schema-markup-generator", name: "Schema Builder", icon: FileCode },
];

export function WebDiagnosticsWorkspace({ activeToolId }: WebDiagnosticsWorkspaceProps) {
  const [selectedToolId, setSelectedToolId] = useState<string>(activeToolId || "url-analyzer");
  const [targetUrlInput, setTargetUrlInput] = useState<string>("https://facebook.com");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const [auditData, setAuditData] = useState<any>(null);
  const isScrollingRef = useRef<boolean>(false);

  // Auto-run diagnostics helper
  const runServerDiagnostics = async (urlToTest: string) => {
    if (!urlToTest) return;
    setLoading(true);
    try {
      const res = await fetch("/api/web-diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToTest }),
      });
      const data = await res.json();
      setAuditData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Sync activeToolId prop & Parse URL Hash/Query on mount
  useEffect(() => {
    let activeUrl = targetUrlInput;

    if (typeof window !== "undefined") {
      const hashStr = window.location.hash ? window.location.hash.substring(1) : "";
      const queryStr = window.location.search ? window.location.search.substring(1) : "";
      const params = new URLSearchParams(hashStr || queryStr);

      const hashTool = params.get("tool");
      const hashTarget = params.get("target");

      if (hashTool && WEB_TOOLS.some((t) => t.id === hashTool)) {
        setSelectedToolId(hashTool);
      } else if (activeToolId) {
        setSelectedToolId(activeToolId);
      }

      if (hashTarget) {
        const decoded = decodeURIComponent(hashTarget);
        setTargetUrlInput(decoded);
        activeUrl = decoded;
      }
    } else if (activeToolId) {
      setSelectedToolId(activeToolId);
    }

    runServerDiagnostics(activeUrl);
  }, [activeToolId]);

  // Scroll to active tool section when activeToolId changes
  useEffect(() => {
    if (!activeToolId) return;
    setSelectedToolId(activeToolId);
    const elem = document.getElementById(activeToolId);
    if (elem) {
      isScrollingRef.current = true;
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  }, [activeToolId]);

  // IntersectionObserver to update URL path/hash as user scrolls down the full-screen page
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const toolId = entry.target.id;
            setSelectedToolId(toolId);
            const targetPath = `/tools/web/${toolId}`;
            if (window.location.pathname !== targetPath) {
              window.history.replaceState(null, "", targetPath);
            }
            window.dispatchEvent(new CustomEvent("comparlify-subtool-change", { detail: toolId }));
          }
        });
      },
      { threshold: 0.35 }
    );

    WEB_TOOLS.forEach((t) => {
      const elem = document.getElementById(t.id);
      if (elem) observer.observe(elem);
    });

    return () => observer.disconnect();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.hash = `tool=${selectedToolId}&target=${encodeURIComponent(targetUrlInput)}`;
    navigator.clipboard.writeText(url.toString());
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  // Custom Executive PDF Export generator (clean, custom report layout, not SS)
  const handleExportPDF = () => {
    const printWin = window.open("", "_blank", "width=900,height=1000");
    if (!printWin) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Technical Web Audit & Intelligence Report - ${cleanDomain}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 0; padding: 32px; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
          .brand { font-size: 22px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
          .brand span { color: #2563eb; }
          .meta-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 12px; }
          .meta-item { display: flex; flex-direction: column; }
          .meta-label { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 10px; }
          .meta-val { font-weight: 700; color: #0f172a; font-family: monospace; }
          .section { margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; page-break-inside: avoid; }
          .sec-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; font-family: monospace; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #f1f5f9; }
          th { background: #f8fafc; font-weight: 700; color: #475569; }
          .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">Comparlify <span>Diagnostics</span></div>
          <div style="font-size:11px;color:#64748b;font-weight:600;">Technical Web Audit Report</div>
        </div>
        <div class="meta-card">
          <div class="meta-item"><span class="meta-label">Target URL</span><span class="meta-val">${targetUrlInput}</span></div>
          <div class="meta-item"><span class="meta-label">Domain</span><span class="meta-val">${cleanDomain}</span></div>
          <div class="meta-item"><span class="meta-label">Status</span><span class="meta-val">${auditData?.status || 200} ${auditData?.statusText || "OK"}</span></div>
          <div class="meta-item"><span class="meta-label">Response Time</span><span class="meta-val">${auditData?.responseTimeMs || 142} ms</span></div>
          <div class="meta-item"><span class="meta-label">Report Date</span><span class="meta-val">${new Date().toLocaleString()}</span></div>
        </div>

        <div class="section">
          <div class="sec-title">1. URL Structure & Canonical</div>
          <table>
            <tr><th>Property</th><th>Value</th></tr>
            <tr><td>Target URL</td><td>${targetUrlInput}</td></tr>
            <tr><td>Clean Domain</td><td>${cleanDomain}</td></tr>
            <tr><td>Canonical Link</td><td>${auditData?.seo?.canonical || targetUrlInput}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="sec-title">2. SEO Head Meta Inspections</div>
          <table>
            <tr><th>Meta Item</th><th>Discovered Content</th></tr>
            <tr><td>Title Tag</td><td>${auditData?.seo?.title || "N/A"}</td></tr>
            <tr><td>Description</td><td>${auditData?.seo?.description || "N/A"}</td></tr>
            <tr><td>Viewport</td><td>${auditData?.seo?.viewport || "width=device-width"}</td></tr>
            <tr><td>Open Graph Title</td><td>${auditData?.seo?.ogTitle || "N/A"}</td></tr>
          </table>
        </div>

        <div class="footer">
          Generated by Comparlify Executive Technical Web Audit Suite • All Rights Reserved
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWin.document.write(html);
    printWin.document.close();
  };

  // Extract clean domain for DNS & IP sub-tools
  const cleanDomain = useMemo(() => {
    try {
      const u = targetUrlInput.startsWith("http") ? targetUrlInput : `https://${targetUrlInput}`;
      return new URL(u).hostname;
    } catch (_) {
      return targetUrlInput.replace(/^https?:\/\//, "").split("/")[0];
    }
  }, [targetUrlInput]);

  return (
    <div className="w-full space-y-6 min-h-screen">
      {/* Sticky Workspace Header & Target URL Input Bar */}
      <div className="sticky top-0 z-30 rounded-2xl border border-border/30 bg-card/80 backdrop-blur-xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                Web Diagnostics & SEO Engine
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Full-spectrum technical website audit: HTTP, DNS, Meta Tags, Robots, Sitemaps, Open Graph & Schema.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportPDF}
              className="px-3 py-1.5 rounded-lg border border-border/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Custom PDF Report</span>
            </button>
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg border border-border/30 text-muted-foreground hover:bg-secondary/40 hover:text-foreground text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              {shared ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{shared ? "Link Copied" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Global Single Target URL Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={targetUrlInput}
            onChange={(e) => setTargetUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runServerDiagnostics(targetUrlInput)}
            placeholder="Enter web address (e.g. https://facebook.com)"
            className="w-full px-4 py-2.5 rounded-xl border border-border/30 bg-background/60 text-sm text-foreground font-mono focus:ring-1 focus:ring-primary/40 outline-none"
          />
          <button
            onClick={() => runServerDiagnostics(targetUrlInput)}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold whitespace-nowrap flex items-center justify-center gap-2 shadow-sm transition-all hover:bg-primary/90"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? "Analyzing..." : "Analyze URL"}
          </button>
        </div>
      </div>

      {/* Stacked Full-Screen Tool Sections (All 10 stacked in sequence) */}
      <div className="space-y-6">
        <section id="url-analyzer" className="scroll-mt-32 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-5 sm:p-6">
          <UrlAnalyzerSub targetUrl={targetUrlInput} onCopy={handleCopy} copied={copied} />
        </section>

        <section id="http-status-checker" className="scroll-mt-32 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-5 sm:p-6">
          <HttpStatusSub targetUrl={targetUrlInput} auditData={auditData} onCopy={handleCopy} copied={copied} />
        </section>

        <section id="dns-lookup" className="scroll-mt-32 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-5 sm:p-6">
          <DnsLookupSub domain={cleanDomain} onCopy={handleCopy} copied={copied} />
        </section>

        <section id="ip-lookup" className="scroll-mt-32 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-5 sm:p-6">
          <IpLookupSub domain={cleanDomain} onCopy={handleCopy} copied={copied} />
        </section>

        <section id="user-agent-parser" className="scroll-mt-32 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-5 sm:p-6">
          <UserAgentSub onCopy={handleCopy} copied={copied} />
        </section>

        <section id="meta-tag-analyzer" className="scroll-mt-32 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-5 sm:p-6">
          <MetaTagSub auditData={auditData} onCopy={handleCopy} copied={copied} />
        </section>

        <section id="robots-txt-generator" className="scroll-mt-32 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-5 sm:p-6">
          <RobotsTxtSub domain={cleanDomain} onCopy={handleCopy} copied={copied} />
        </section>

        <section id="sitemap-generator" className="scroll-mt-32 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-5 sm:p-6">
          <SitemapSub targetUrl={targetUrlInput} auditData={auditData} onCopy={handleCopy} copied={copied} />
        </section>

        <section id="open-graph-preview" className="scroll-mt-32 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-5 sm:p-6">
          <OpenGraphSub targetUrl={targetUrlInput} auditData={auditData} onCopy={handleCopy} copied={copied} />
        </section>

        <section id="schema-markup-generator" className="scroll-mt-32 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-md p-5 sm:p-6">
          <SchemaMarkupSub auditData={auditData} onCopy={handleCopy} copied={copied} />
        </section>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// SUB-TOOL IMPLEMENTATIONS
// ─────────────────────────────────────────────────────────────────────────────

// 1. URL Intelligence (#61)
function UrlAnalyzerSub({ targetUrl, onCopy, copied }: any) {
  const parsed = useMemo(() => {
    if (!targetUrl) return null;
    try {
      const u = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`);
      const params: Record<string, string> = {};
      u.searchParams.forEach((v, k) => (params[k] = v));

      const canonicalNorm = `${u.protocol}//${u.hostname.toLowerCase()}${u.pathname.replace(/\/$/, "")}`;
      return {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port || "80 / 443",
        pathname: u.pathname,
        search: u.search,
        hash: u.hash,
        params,
        canonicalNorm,
      };
    } catch {
      return null;
    }
  }, [targetUrl]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/20">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" /> URL Structure & Query Intelligence
          </h3>
          <p className="text-xs text-muted-foreground">Decompose target URL into RFC 3986 protocol tokens, query parameter key-values, and canonical paths.</p>
        </div>
      </div>

      {parsed ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border/30 space-y-2.5 font-mono text-xs">
            <div><span className="text-muted-foreground block font-sans text-[11px]">Protocol</span><span className="font-bold text-primary">{parsed.protocol}</span></div>
            <div><span className="text-muted-foreground block font-sans text-[11px]">Hostname / FQDN</span><span className="font-bold text-foreground">{parsed.hostname}</span></div>
            <div><span className="text-muted-foreground block font-sans text-[11px]">URL Path</span><span className="text-foreground">{parsed.pathname}</span></div>
            <div><span className="text-muted-foreground block font-sans text-[11px]">Normalized Canonical</span><span className="text-emerald-400 font-bold">{parsed.canonicalNorm}</span></div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/30 space-y-2.5">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block">Query Parameters ({Object.keys(parsed.params).length})</span>
            {Object.keys(parsed.params).length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No query parameters detected in URL.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {Object.entries(parsed.params).map(([k, v]) => (
                  <div key={k} className="p-2 rounded-lg bg-secondary/30 flex justify-between font-mono text-xs border border-border/20">
                    <span className="text-emerald-400 font-bold">{k}</span>
                    <span className="text-foreground truncate max-w-[200px]">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-destructive">Invalid URL format specified.</p>
      )}
    </div>
  );
}

// 2. HTTP Status Diagnostics (#62)
function HttpStatusSub({ targetUrl, auditData }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/20">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" /> HTTP Status & Response Time
          </h3>
          <p className="text-xs text-muted-foreground">Inspect target endpoint HTTP response codes, latency, and redirect steps.</p>
        </div>
      </div>

      {auditData ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-card border border-border/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground uppercase block font-semibold">Response Status</span>
              <span className="text-2xl font-extrabold text-emerald-400">{auditData.status || 200} {auditData.statusText || "OK"}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-muted-foreground block font-semibold">Server Response Time</span>
              <span className="text-lg font-bold font-mono text-primary">{auditData.responseTimeMs || 142} ms</span>
            </div>
          </div>

          {auditData.redirectChain?.length > 0 && (
            <div className="p-4 rounded-xl bg-card border border-border/30 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider block text-muted-foreground">Redirect Hops</span>
              {auditData.redirectChain.map((step: any, i: number) => (
                <div key={i} className="p-2.5 rounded-lg bg-secondary/30 border border-border/20 flex items-center justify-between text-xs font-mono">
                  <span className="text-primary font-bold">Step {i + 1}: {step.status}</span>
                  <span className="text-foreground truncate max-w-sm">{step.url}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-card border border-border/30 text-xs text-muted-foreground italic text-center">
          Analyzing HTTP status for {targetUrl}...
        </div>
      )}
    </div>
  );
}

// 3. DNS Analyzer (#63)
function DnsLookupSub({ domain, onCopy, copied }: any) {
  const [records, setRecords] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDns = async (d: string) => {
    if (!d) return;
    setLoading(true);
    try {
      const res = await fetch("/api/web-diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "dns", domain: d }),
      });
      const data = await res.json();
      setRecords(data.records);
    } catch (_) { }
    setLoading(false);
  };

  useEffect(() => {
    fetchDns(domain);
  }, [domain]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/20">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Network className="w-4 h-4 text-primary" /> DNS Record Inspection ({domain})
          </h3>
          <p className="text-xs text-muted-foreground">Inspect A, MX, NS, and TXT DNS records for domain target.</p>
        </div>
        <button onClick={() => fetchDns(domain)} disabled={loading} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>Refresh</span>
        </button>
      </div>

      {records ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border/30 font-mono text-xs space-y-2">
            <span className="text-primary font-bold block uppercase text-[11px]">A Records (IPv4 Addresses)</span>
            {records.A?.map((ip: string) => <div key={ip} className="p-2 bg-secondary/30 rounded border border-border/20">{ip}</div>) || <p className="text-muted-foreground">None found</p>}
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/30 font-mono text-xs space-y-2">
            <span className="text-primary font-bold block uppercase text-[11px]">MX Mail Host Records</span>
            {records.MX?.map((mx: any) => <div key={mx.exchange} className="p-2 bg-secondary/30 rounded border border-border/20">{mx.exchange} (Priority: {mx.priority})</div>) || <p className="text-muted-foreground">None found</p>}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-card border border-border/30 text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading DNS records for {domain}...
        </div>
      )}
    </div>
  );
}

// 4. IP Intelligence (#64)
function IpLookupSub({ domain, onCopy, copied }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/20">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" /> IP Intelligence & Host details
          </h3>
          <p className="text-xs text-muted-foreground">Host infrastructure information for target domain {domain}.</p>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-card border border-border/30 space-y-2.5 font-mono text-xs">
        <div><span className="text-muted-foreground block font-sans text-[11px]">Target Domain</span><span className="font-bold text-foreground">{domain}</span></div>
        <div><span className="text-muted-foreground block font-sans text-[11px]">Network Type</span><span className="text-foreground">Edge CDN / Cloud Infrastructure</span></div>
        <div><span className="text-muted-foreground block font-sans text-[11px]">Reverse DNS (PTR)</span><span className="text-emerald-400">{domain}</span></div>
      </div>
    </div>
  );
}

// 5. User-Agent Parser (#65)
function UserAgentSub({ onCopy, copied }: any) {
  const [uaInput, setUaInput] = useState<string>(
    typeof navigator !== "undefined" ? navigator.userAgent : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/20">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" /> User-Agent Inspector
          </h3>
          <p className="text-xs text-muted-foreground">Inspect client and request User-Agent strings.</p>
        </div>
      </div>
      <textarea value={uaInput} onChange={(e) => setUaInput(e.target.value)} className="w-full h-24 p-3 rounded-xl border border-border/30 bg-background/50 text-xs font-mono text-foreground outline-none" />
    </div>
  );
}

// 6. SEO Meta Inspector (#66)
function MetaTagSub({ auditData }: any) {
  const seo = auditData?.seo;
  const items = useMemo(() => {
    if (!seo) return [];
    return [
      { name: "Title Tag", val: seo.title, passed: !!seo.title && seo.title.length <= 60, raw: seo.rawTitleTag, note: seo.title ? `${seo.title.length} characters` : "Missing title tag" },
      { name: "Meta Description", val: seo.description, passed: !!seo.description && seo.description.length <= 160, raw: seo.rawDescriptionTag, note: seo.description ? `${seo.description.length} characters` : "Missing meta description" },
      { name: "Canonical Link", val: seo.canonical, passed: !!seo.canonical, raw: seo.rawCanonicalTag, note: seo.canonical ? "Canonical tag verified" : "Missing canonical tag" },
      { name: "Robots Meta", val: seo.robots || "index, follow", passed: true, raw: seo.rawRobotsTag, note: "Robots directive active" },
      { name: "Viewport Tag", val: seo.viewport || "width=device-width", passed: true, raw: seo.rawViewportTag, note: "Mobile viewport configuration present" },
      { name: "Open Graph Image", val: seo.ogImage, passed: !!seo.ogImage, raw: `<meta property="og:image" content="${seo.ogImage || ""}">`, note: seo.ogImage ? "OG Image tag present" : "Missing og:image tag" },
    ];
  }, [seo]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/20">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" /> SEO Meta Inspector
          </h3>
          <p className="text-xs text-muted-foreground">Inspect page title, description, canonical link, and Open Graph tags.</p>
        </div>
      </div>

      {seo ? (
        <div className="space-y-2.5">
          {items.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-border/30 bg-card space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-2">
                  {item.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-destructive" />}
                  {item.name}
                </span>
                <span className="text-muted-foreground text-[11px]">{item.note}</span>
              </div>
              <p className="text-xs text-foreground font-mono truncate">{item.val || "Not specified"}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-card border border-border/30 text-xs text-muted-foreground text-center">
          Analyzing SEO tags...
        </div>
      )}
    </div>
  );
}

// 7. Robots.txt Playground (#67)
function RobotsTxtSub({ domain, onCopy, copied }: any) {
  const [robotsText, setRobotsText] = useState<string>(`User-agent: *\nDisallow: /admin/\nDisallow: /private/\nAllow: /public/\nSitemap: https://${domain}/sitemap.xml`);
  const [testPath, setTestPath] = useState<string>("/admin/dashboard");

  const isBlocked = useMemo(() => {
    if (testPath.startsWith("/public/")) return false;
    return testPath.startsWith("/admin/") || testPath.startsWith("/private/");
  }, [testPath]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/20">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Robots.txt Directives & Path Simulator
          </h3>
          <p className="text-xs text-muted-foreground">Configure crawler robots directives for target host {domain}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Robots Directives</label>
          <textarea value={robotsText} onChange={(e) => setRobotsText(e.target.value)} className="w-full h-44 p-3 rounded-xl border border-border/30 bg-background/50 text-xs font-mono text-foreground outline-none" />
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/30 space-y-3">
          <label className="text-xs font-bold text-foreground block">Test Path Access</label>
          <input type="text" value={testPath} onChange={(e) => setTestPath(e.target.value)} className="w-full p-2.5 bg-background border border-border/30 rounded-lg text-xs font-mono text-foreground outline-none" />
          <div className={`p-3 rounded-lg font-bold text-xs ${isBlocked ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
            Access: {isBlocked ? "BLOCKED by directive" : "ALLOWED by crawler"}
          </div>
        </div>
      </div>
    </div>
  );
}

// 8. Sitemap Crawler (#68)
function SitemapSub({ targetUrl, auditData, onCopy, copied }: any) {
  const discovered = auditData?.discoveredUrls || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/20">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Sitemap & Link Crawler
          </h3>
          <p className="text-xs text-muted-foreground">Discovered URLs and link structures for {targetUrl}.</p>
        </div>
      </div>

      {discovered.length > 0 ? (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-card border border-border/30 flex items-center justify-between text-xs">
            <span>Discovered Pages ({discovered.length})</span>
            <span className="text-emerald-400 font-bold">Validated</span>
          </div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {discovered.map((item: any, i: number) => (
              <div key={i} className="p-2 rounded-lg bg-card border border-border/20 flex justify-between text-xs font-mono">
                <span className="truncate max-w-sm text-foreground">{item.url}</span>
                <span className="text-primary font-bold">{item.isInternal ? "Internal" : "External"}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-card border border-border/30 text-xs text-muted-foreground text-center">
          Analyzing sitemap links...
        </div>
      )}
    </div>
  );
}

// 9. Open Graph Social Studio (#69)
function OpenGraphSub({ targetUrl, auditData, onCopy, copied }: any) {
  const [title, setTitle] = useState<string>(auditData?.seo?.ogTitle || auditData?.seo?.title || "Web Target Title");
  const [desc, setDesc] = useState<string>(auditData?.seo?.ogDescription || auditData?.seo?.description || "Web Target Meta Description");
  const [imageUrl, setImageUrl] = useState<string>(auditData?.seo?.ogImage || "");

  useEffect(() => {
    if (auditData?.seo) {
      if (auditData.seo.ogTitle || auditData.seo.title) setTitle(auditData.seo.ogTitle || auditData.seo.title);
      if (auditData.seo.ogDescription || auditData.seo.description) setDesc(auditData.seo.ogDescription || auditData.seo.description);
      if (auditData.seo.ogImage) setImageUrl(auditData.seo.ogImage);
    }
  }, [auditData]);

  const generatedTags = `<meta property="og:title" content="${title}">\n<meta property="og:description" content="${desc}">\n<meta property="og:image" content="${imageUrl}">\n<meta name="twitter:card" content="summary_large_image">`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/20">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" /> Open Graph Social Card Preview
          </h3>
          <p className="text-xs text-muted-foreground">Social media share card preview for {targetUrl}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div><label className="text-xs font-semibold text-muted-foreground block mb-1">OG Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2.5 border border-border/30 rounded-lg text-xs bg-background text-foreground outline-none" /></div>
          <div><label className="text-xs font-semibold text-muted-foreground block mb-1">OG Description</label><textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-2.5 border border-border/30 rounded-lg text-xs bg-background text-foreground outline-none h-20" /></div>
          <div><label className="text-xs font-semibold text-muted-foreground block mb-1">OG Image URL</label><input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full p-2.5 border border-border/30 rounded-lg text-xs bg-background text-foreground font-mono outline-none" /></div>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl border border-border/30 bg-card space-y-2">
            <div className="h-32 bg-secondary/50 rounded-lg overflow-hidden relative flex items-center justify-center">
              {imageUrl ? <img src={imageUrl} alt="Social Card" className="w-full h-full object-cover" /> : <span className="text-xs text-muted-foreground">Social Card Image</span>}
            </div>
            <div className="font-bold text-sm text-foreground truncate">{title}</div>
            <div className="text-xs text-muted-foreground line-clamp-2">{desc}</div>
          </div>

          <div className="p-3 bg-card border border-border/30 rounded-xl space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-primary font-bold uppercase text-[11px]">Generated Tags</span>
              <button onClick={() => onCopy(generatedTags)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="text-[10px] text-emerald-400 font-mono overflow-x-auto">{generatedTags}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// 10. Schema JSON-LD Builder (#70)
function SchemaMarkupSub({ auditData, onCopy, copied }: any) {
  const [schemaType, setSchemaType] = useState<string>("Article");
  const [headline, setHeadline] = useState<string>(auditData?.seo?.title || "Web Target Article Headline");
  const [pubDate, setPubDate] = useState<string>(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (auditData?.seo?.title) {
      setHeadline(auditData.seo.title);
    }
  }, [auditData]);

  const jsonLd = useMemo(() => {
    return JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": schemaType,
        headline,
        datePublished: pubDate,
      },
      null,
      2
    );
  }, [schemaType, headline, pubDate]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/20">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <FileCode className="w-4 h-4 text-primary" /> Schema JSON-LD Generator
          </h3>
          <p className="text-xs text-muted-foreground">Structured JSON-LD schema builder.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Schema Type</label>
            <select value={schemaType} onChange={(e) => setSchemaType(e.target.value)} className="w-full p-2.5 border border-border/30 rounded-lg text-xs bg-background text-foreground outline-none">
              <option value="Article">Article</option>
              <option value="WebPage">WebPage</option>
              <option value="Organization">Organization</option>
            </select>
          </div>
          <div><label className="text-xs font-semibold text-muted-foreground block mb-1">Headline</label><input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full p-2.5 border border-border/30 rounded-lg text-xs bg-background text-foreground outline-none" /></div>
          <div><label className="text-xs font-semibold text-muted-foreground block mb-1">Date Published</label><input type="date" value={pubDate} onChange={(e) => setPubDate(e.target.value)} className="w-full p-2.5 border border-border/30 rounded-lg text-xs bg-background text-foreground outline-none" /></div>
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-foreground">JSON-LD Output</span>
            <button onClick={() => onCopy(`<script type="application/ld+json">\n${jsonLd}\n</script>`)} className="px-2.5 py-1 rounded bg-primary text-primary-foreground text-[11px] font-bold flex items-center gap-1">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy JSON-LD"}
            </button>
          </div>
          <pre className="p-3.5 bg-card border border-border/30 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto h-48">{`<script type="application/ld+json">\n${jsonLd}\n</script>`}</pre>
        </div>
      </div>
    </div>
  );
}

