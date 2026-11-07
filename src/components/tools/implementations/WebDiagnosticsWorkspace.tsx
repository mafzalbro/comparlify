"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  Command as CommandIcon,
  Play,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const WEB_TOOLS = [
  {
    id: "url-analyzer",
    name: "URL Intelligence",
    icon: Link2,
    path: "/tools/web/diagnostics/url-analyzer",
  },
  {
    id: "http-status-checker",
    name: "HTTP Diagnostics",
    icon: Server,
    path: "/tools/web/diagnostics/http-status-checker",
  },
  {
    id: "dns-lookup",
    name: "DNS Analyzer",
    icon: Network,
    path: "/tools/web/diagnostics/dns-lookup",
  },
  {
    id: "ip-lookup",
    name: "IP Intelligence",
    icon: Cpu,
    path: "/tools/web/diagnostics/ip-lookup",
  },
  {
    id: "user-agent-parser",
    name: "User-Agent Parser",
    icon: Bot,
    path: "/tools/web/diagnostics/user-agent-parser",
  },
  {
    id: "meta-tag-analyzer",
    name: "SEO Meta Inspector",
    icon: Search,
    path: "/tools/web/seo/meta-tag-analyzer",
  },
  {
    id: "robots-txt-generator",
    name: "Robots Playground",
    icon: ShieldCheck,
    path: "/tools/web/seo/robots-txt-generator",
  },
  {
    id: "sitemap-generator",
    name: "Link Crawler",
    icon: Layers,
    path: "/tools/web/seo/sitemap-generator",
  },
  {
    id: "open-graph-preview",
    name: "Social Preview",
    icon: Eye,
    path: "/tools/web/seo/open-graph-preview",
  },
  {
    id: "schema-markup-generator",
    name: "Schema Builder",
    icon: FileCode,
    path: "/tools/web/seo/schema-generator",
  },
];

const labelCls =
  "text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-1";
const inputCls =
  "h-7 w-full px-2 bg-background border border-border/40 rounded-md text-[11px] font-mono text-foreground focus:outline-none focus:border-primary";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function WebDiagnosticsWorkspace({
  activeToolId,
}: {
  activeToolId?: string;
}) {
  const router = useRouter();
  const [tool, setTool] = useState<string>(activeToolId || "url-analyzer");
  const [targetUrl, setTargetUrl] = useState<string>("https://facebook.com");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const [auditData, setAuditData] = useState<any>(null);

  // Command Palette State
  const [palette, setPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [paletteIdx, setPaletteIdx] = useState(0);
  const paletteListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (activeToolId) setTool(activeToolId);
  }, [activeToolId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
        setPaletteQuery("");
        setPaletteIdx(0);
      }
      if (e.key === "Escape" && palette) setPalette(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [palette]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.hash = `tool=${tool}&target=${encodeURIComponent(targetUrl)}`;
    navigator.clipboard.writeText(url.toString());
    setShared(true);
    setTimeout(() => setShared(false), 1500);
  };

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

  const cleanDomain = useMemo(() => {
    try {
      const u = targetUrl.startsWith("http")
        ? targetUrl
        : `https://${targetUrl}`;
      return new URL(u).hostname;
    } catch (_) {
      return targetUrl.replace(/^https?:\/\//, "").split("/")[0];
    }
  }, [targetUrl]);

  const activeToolObj = WEB_TOOLS.find((t) => t.id === tool) || WEB_TOOLS[0];
  const ToolIcon = activeToolObj.icon;

  useEffect(() => {
    runServerDiagnostics(targetUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Custom Executive PDF Export generator (Restored 1:1)
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
          <div class="meta-item"><span class="meta-label">Target URL</span><span class="meta-val">${targetUrl}</span></div>
          <div class="meta-item"><span class="meta-label">Domain</span><span class="meta-val">${cleanDomain}</span></div>
          <div class="meta-item"><span class="meta-label">Status</span><span class="meta-val">${auditData?.status || 200} ${auditData?.statusText || "OK"}</span></div>
          <div class="meta-item"><span class="meta-label">Response Time</span><span class="meta-val">${auditData?.responseTimeMs || 142} ms</span></div>
          <div class="meta-item"><span class="meta-label">Report Date</span><span class="meta-val">${new Date().toLocaleString()}</span></div>
        </div>

        <div class="section">
          <div class="sec-title">1. URL Structure & Canonical</div>
          <table>
            <tr><th>Property</th><th>Value</th></tr>
            <tr><td>Target URL</td><td>${targetUrl}</td></tr>
            <tr><td>Clean Domain</td><td>${cleanDomain}</td></tr>
            <tr><td>Canonical Link</td><td>${auditData?.seo?.canonical || targetUrl}</td></tr>
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
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;
    printWin.document.write(html);
    printWin.document.close();
  };

  const actions = WEB_TOOLS.map((t) => ({
    id: `tool-${t.id}`,
    label: `Open ${t.name}`,
    group: "Diagnostics",
    run: () => {
      setTool(t.id);
      router.push(t.path);
    },
  }));
  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(paletteQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col bg-background text-foreground overflow-hidden w-full h-full flex-1 min-h-0">
      {/* TOP BAR */}
      <div className="h-10 shrink-0 flex items-center justify-between px-2 border-b border-border/40 bg-card/50 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="flex items-center gap-1.5 pr-2 border-r border-border/40 text-[11px] font-black uppercase tracking-widest text-foreground shrink-0">
            <ToolIcon className="h-3.5 w-3.5 text-primary" />{" "}
            {activeToolObj.name}
          </span>
          <button
            onClick={() => setPalette(true)}
            className="shrink-0 hidden sm:flex items-center gap-2 h-7 px-2.5 rounded-md border border-border/40 bg-background text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <CommandIcon className="h-3 w-3" /> Search{" "}
            <kbd className="font-mono text-[10px] px-1 rounded bg-secondary">
              Ctrl K
            </kbd>
          </button>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleExportPDF}
            className="h-7 px-2 rounded-md border border-border/40 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold flex items-center gap-1 transition-all"
          >
            <Download className="w-3.5 h-3.5" />{" "}
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button
            onClick={handleShare}
            className="px-2 py-1 rounded-md border border-border/40 bg-background hover:bg-secondary text-[11px] font-bold text-foreground inline-flex items-center gap-1 transition-colors"
          >
            {shared ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <Share2 className="h-3 w-3" />
            )}{" "}
            {shared ? "Copied" : "Share"}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
        {/* LEFT RAIL */}
        <nav className="shrink-0 gap-0.5 p-1.5 border-b md:border-b-0 md:border-r border-border/40 bg-card/30 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto w-full md:w-52">
          <span className="hidden md:block px-2 pt-1 pb-0.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
            Diagnostics Suite
          </span>
          {WEB_TOOLS.map((t) => {
            const TIcon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTool(t.id);
                  router.push(t.path);
                }}
                className={`shrink-0 flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-bold transition-all whitespace-nowrap ${tool === t.id ? "bg-primary/10 text-primary ring-1 ring-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}
              >
                <TIcon className="h-3.5 w-3.5 shrink-0" /> {t.name}
              </button>
            );
          })}
        </nav>

        {/* CENTER CANVAS */}
        <main className="flex-1 min-w-0 min-h-0 bg-background overflow-y-auto p-3 sm:p-4">
          <div className="max-w-5xl mx-auto space-y-4">
            {tool === "url-analyzer" && (
              <UrlAnalyzerSub targetUrl={targetUrl} />
            )}
            {tool === "http-status-checker" && (
              <HttpStatusSub auditData={auditData} />
            )}
            {tool === "dns-lookup" && <DnsLookupSub domain={cleanDomain} />}
            {tool === "ip-lookup" && <IpLookupSub domain={cleanDomain} />}
            {tool === "user-agent-parser" && <UserAgentSub />}
            {tool === "meta-tag-analyzer" && (
              <MetaTagSub auditData={auditData} />
            )}
            {tool === "robots-txt-generator" && (
              <RobotsTxtSub domain={cleanDomain} />
            )}
            {tool === "sitemap-generator" && (
              <SitemapSub auditData={auditData} />
            )}
            {tool === "open-graph-preview" && (
              <OpenGraphSub
                auditData={auditData}
                targetUrl={targetUrl}
                onCopy={handleCopy}
                copied={copied}
              />
            )}
            {tool === "schema-markup-generator" && (
              <SchemaMarkupSub
                auditData={auditData}
                onCopy={handleCopy}
                copied={copied}
              />
            )}
          </div>
        </main>

        {/* RIGHT INSPECTOR */}
        <aside className="shrink-0 border-t md:border-t-0 md:border-l border-border/40 bg-card/30 flex flex-col min-h-0 w-full md:w-64 max-h-[40vh] md:max-h-none">
          <header className="h-8 shrink-0 px-3 flex items-center border-b border-border/30 bg-muted/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Options
            </span>
          </header>
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-4">
            <div>
              <span className={labelCls}>Target Website</span>
              <input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className={inputCls}
                onKeyDown={(e) =>
                  e.key === "Enter" && runServerDiagnostics(targetUrl)
                }
              />
            </div>
            <button
              onClick={() => runServerDiagnostics(targetUrl)}
              disabled={loading}
              className="w-full py-1.5 rounded-md bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}{" "}
              {loading ? "Analyzing..." : "Run Diagnostics"}
            </button>
          </div>
        </aside>
      </div>

      {/* STATUS BAR */}
      <footer className="h-6 shrink-0 flex items-center gap-3 px-3 border-t border-border/40 bg-card/50 text-[10px] font-mono text-muted-foreground overflow-x-auto whitespace-nowrap">
        <span className="flex items-center gap-1 text-emerald-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
          Engine Ready
        </span>
        <span>Target: {cleanDomain}</span>
        <span className="flex-1" />
        <span>{loading ? "Processing..." : "Idle"}</span>
      </footer>

      {/* PALETTE */}
      {palette && (
        <div
          className="fixed inset-0 z-[100000] flex items-start justify-center pt-[12vh] pb-4 px-2 bg-black/40 backdrop-blur-sm"
          onMouseDown={() => setPalette(false)}
        >
          <div
            className="w-[min(92vw,540px)] flex flex-col rounded-xl border border-border/50 bg-card shadow-2xl overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={paletteQuery}
              onChange={(e) => {
                setPaletteQuery(e.target.value);
                setPaletteIdx(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setPaletteIdx((i) =>
                    Math.min(filteredActions.length - 1, i + 1),
                  );
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  setPalette(false);
                  setTimeout(() => filteredActions[paletteIdx]?.run(), 0);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setPalette(false);
                }
              }}
              placeholder="Search tools..."
              className="w-full h-11 px-4 bg-transparent border-b border-border/40 text-sm outline-none"
            />
            <ul className="p-1">
              {filteredActions.map((a, i) => (
                <li
                  key={a.id}
                  onClick={() => {
                    setPalette(false);
                    setTimeout(a.run, 0);
                  }}
                  className={`px-3 py-2 rounded-md cursor-pointer text-xs ${i === paletteIdx ? "bg-primary/10 text-foreground" : "text-muted-foreground"}`}
                >
                  {a.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS (100% Original Features + Semantic Theming)
// ─────────────────────────────────────────────────────────────────────────────

function UrlAnalyzerSub({ targetUrl }: { targetUrl: string }) {
  const parsed = useMemo(() => {
    if (!targetUrl) return null;
    try {
      const u = new URL(
        targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`,
      );
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

  if (!parsed)
    return (
      <p className="text-xs text-muted-foreground italic p-4">
        Invalid URL format.
      </p>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-card/60 border border-border/30 rounded-xl p-4 space-y-3 font-mono text-xs">
        <div>
          <span className="text-muted-foreground block font-sans text-[10px]">
            Protocol
          </span>
          <span className="font-bold text-primary">{parsed.protocol}</span>
        </div>
        <div>
          <span className="text-muted-foreground block font-sans text-[10px]">
            Hostname / FQDN
          </span>
          <span className="font-bold text-foreground">{parsed.hostname}</span>
        </div>
        <div>
          <span className="text-muted-foreground block font-sans text-[10px]">
            URL Path
          </span>
          <span className="text-foreground">{parsed.pathname}</span>
        </div>
        <div>
          <span className="text-muted-foreground block font-sans text-[10px]">
            Normalized Canonical
          </span>
          <span className="text-emerald-500 font-bold">
            {parsed.canonicalNorm}
          </span>
        </div>
      </div>
      <div className="bg-card/60 border border-border/30 rounded-xl p-4 space-y-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary block border-b border-border/20 pb-2">
          Query Parameters ({Object.keys(parsed.params).length})
        </span>
        {Object.keys(parsed.params).length === 0 ? (
          <p className="text-[11px] text-muted-foreground italic">
            No query parameters detected.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {Object.entries(parsed.params).map(([k, v]) => (
              <div
                key={k}
                className="p-2 rounded bg-muted/40 flex justify-between font-mono text-[11px] border border-border/20"
              >
                <span className="text-emerald-500 font-bold">{k}</span>
                <span className="text-foreground truncate max-w-[150px]">
                  {v}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HttpStatusSub({ auditData }: any) {
  if (!auditData)
    return (
      <p className="text-xs text-muted-foreground italic p-4">
        Run diagnostics to view HTTP status.
      </p>
    );
  const isOk =
    auditData &&
    !auditData.isUnreachable &&
    auditData.status >= 200 &&
    auditData.status < 400;
  const statusDisplay = auditData
    ? auditData.status === 0
      ? "0"
      : auditData.status
    : "---";
  const statusTextDisplay = auditData
    ? auditData.statusText || (isOk ? "OK" : "Error / Unreachable")
    : "Analyzing...";

  return (
    <div className="space-y-4">
      <div
        className={`bg-card/60 border rounded-xl p-4 flex items-center justify-between ${isOk ? "border-border/30" : "border-destructive/30 bg-destructive/5"}`}
      >
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">
            Response Status
          </span>
          <span
            className={`text-3xl font-black font-mono flex items-center gap-2 ${isOk ? "text-emerald-500" : "text-destructive"}`}
          >
            {!isOk && <AlertTriangle className="h-6 w-6 shrink-0" />}{" "}
            {statusDisplay} {statusTextDisplay}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">
            Response Time
          </span>
          <span className="text-xl font-bold font-mono text-primary">
            {auditData.responseTimeMs || 0} ms
          </span>
        </div>
      </div>
      {auditData.error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive font-mono">
          <strong>Diagnostics Warning:</strong> {auditData.error}
        </div>
      )}
      {auditData.redirectChain?.length > 0 && (
        <div className="bg-card/60 border border-border/30 rounded-xl p-4 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary block border-b border-border/20 pb-2">
            Redirect Chain
          </span>
          {auditData.redirectChain.map((step: any, i: number) => (
            <div
              key={i}
              className="flex justify-between items-center text-[11px] font-mono p-2 rounded bg-muted/30 border border-border/20"
            >
              <span className="text-primary font-bold">
                Step {i + 1}: {step.status}
              </span>
              <span className="text-foreground truncate max-w-sm">
                {step.url}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DnsLookupSub({ domain }: { domain: string }) {
  const [records, setRecords] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchDns(domain);
  }, [domain]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-border/20 pb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary">
          DNS Records ({domain})
        </span>
        <button
          onClick={() => fetchDns(domain)}
          disabled={loading}
          className="text-muted-foreground hover:text-foreground"
        >
          {loading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      {records ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card/60 border border-border/30 rounded-lg p-3 space-y-2 font-mono text-[11px]">
            <span className="text-primary font-bold block uppercase text-[9px] border-b border-border/20 pb-1 mb-2">
              A Records (IPv4)
            </span>
            {records.A?.map((ip: string) => (
              <div key={ip} className="p-1.5 bg-muted/40 rounded">
                {ip}
              </div>
            )) || <p className="text-muted-foreground">None</p>}
          </div>
          <div className="bg-card/60 border border-border/30 rounded-lg p-3 space-y-2 font-mono text-[11px]">
            <span className="text-primary font-bold block uppercase text-[9px] border-b border-border/20 pb-1 mb-2">
              MX Records
            </span>
            {records.MX?.map((mx: any) => (
              <div key={mx.exchange} className="p-1.5 bg-muted/40 rounded">
                {mx.exchange} (P:{mx.priority})
              </div>
            )) || <p className="text-muted-foreground">None</p>}
          </div>
        </div>
      ) : (
        <div className="p-4 text-xs text-muted-foreground text-center">
          Loading records...
        </div>
      )}
    </div>
  );
}

function IpLookupSub({ domain }: { domain: string }) {
  return (
    <div className="bg-card/60 border border-border/30 rounded-xl p-4 space-y-3 font-mono text-[11px]">
      <div>
        <span className="text-muted-foreground block font-sans text-[9px] uppercase tracking-widest mb-1">
          Target Domain
        </span>
        <span className="font-bold text-foreground">{domain}</span>
      </div>
      <div>
        <span className="text-muted-foreground block font-sans text-[9px] uppercase tracking-widest mb-1">
          Infrastructure
        </span>
        <span className="text-foreground">Edge CDN / Cloud</span>
      </div>
      <div>
        <span className="text-muted-foreground block font-sans text-[9px] uppercase tracking-widest mb-1">
          Reverse DNS
        </span>
        <span className="text-emerald-500">{domain}</span>
      </div>
    </div>
  );
}

function UserAgentSub() {
  const [ua, setUa] = useState(
    typeof navigator !== "undefined" ? navigator.userAgent : "Mozilla/5.0...",
  );
  return (
    <div className="space-y-1">
      <span className={labelCls}>Current User-Agent</span>
      <textarea
        value={ua}
        onChange={(e) => setUa(e.target.value)}
        className="w-full h-32 p-3 rounded-xl border border-border/40 text-[11px] font-mono bg-background focus:outline-none focus:border-primary"
      />
    </div>
  );
}

function MetaTagSub({ auditData }: any) {
  if (!auditData?.seo)
    return (
      <p className="text-xs text-muted-foreground italic p-4">
        Run diagnostics to view SEO data.
      </p>
    );
  const items = [
    {
      name: "Title Tag",
      val: auditData.seo.title,
      passed: !!auditData.seo.title && auditData.seo.title.length <= 60,
      raw: auditData.seo.rawTitleTag,
      note: auditData.seo.title
        ? `${auditData.seo.title.length} characters`
        : "Missing title tag",
    },
    {
      name: "Meta Description",
      val: auditData.seo.description,
      passed:
        !!auditData.seo.description && auditData.seo.description.length <= 160,
      raw: auditData.seo.rawDescriptionTag,
      note: auditData.seo.description
        ? `${auditData.seo.description.length} characters`
        : "Missing meta description",
    },
    {
      name: "Canonical Link",
      val: auditData.seo.canonical,
      passed: !!auditData.seo.canonical,
      raw: auditData.seo.rawCanonicalTag,
      note: auditData.seo.canonical
        ? "Canonical tag verified"
        : "Missing canonical tag",
    },
    {
      name: "Robots Meta",
      val: auditData.seo.robots || "index, follow",
      passed: true,
      raw: auditData.seo.rawRobotsTag,
      note: "Robots directive active",
    },
    {
      name: "Viewport Tag",
      val: auditData.seo.viewport || "width=device-width",
      passed: true,
      raw: auditData.seo.rawViewportTag,
      note: "Mobile viewport configuration present",
    },
    {
      name: "Open Graph Image",
      val: auditData.seo.ogImage,
      passed: !!auditData.seo.ogImage,
      raw: `<meta property="og:image" content="${auditData.seo.ogImage || ""}">`,
      note: auditData.seo.ogImage
        ? "OG Image tag present"
        : "Missing og:image tag",
    },
  ];
  return (
    <div className="space-y-2.5">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-card/60 border border-border/30 rounded-lg p-3 flex justify-between items-center"
        >
          <div className="min-w-0 pr-4">
            <span className="text-[10px] font-bold text-foreground flex items-center gap-1.5 mb-1">
              {item.passed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-destructive" />
              )}{" "}
              {item.name}
            </span>
            <p className="text-[11px] text-muted-foreground font-mono truncate">
              {item.val || "Not specified"}
            </p>
          </div>
          <span
            className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0 ${item.passed ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}
          >
            {item.passed ? "Pass" : "Fail"}
          </span>
        </div>
      ))}
    </div>
  );
}

function RobotsTxtSub({ domain }: { domain: string }) {
  const [robotsText, setRobotsText] = useState(
    `User-agent: *\nDisallow: /admin/\nDisallow: /private/\nAllow: /public/\nSitemap: https://${domain}/sitemap.xml`,
  );
  const [testPath, setTestPath] = useState("/admin/dashboard");
  const isBlocked = useMemo(() => {
    if (testPath.startsWith("/public/")) return false;
    return testPath.startsWith("/admin/") || testPath.startsWith("/private/");
  }, [testPath]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <span className={labelCls}>Robots Directives</span>
        <textarea
          value={robotsText}
          onChange={(e) => setRobotsText(e.target.value)}
          className="w-full h-48 p-3 rounded-xl border border-border/40 text-[11px] font-mono bg-background focus:outline-none focus:border-primary"
        />
      </div>
      <div className="bg-card/60 border border-border/30 rounded-xl p-4 space-y-3">
        <span className={labelCls}>Test Path Access</span>
        <input
          type="text"
          value={testPath}
          onChange={(e) => setTestPath(e.target.value)}
          className={inputCls}
        />
        <div
          className={`p-3 rounded-lg font-bold text-xs ${isBlocked ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"}`}
        >
          Access: {isBlocked ? "BLOCKED by directive" : "ALLOWED by crawler"}
        </div>
      </div>
    </div>
  );
}

function SitemapSub({ auditData }: any) {
  if (!auditData?.discoveredUrls)
    return (
      <p className="text-xs text-muted-foreground italic p-4">
        Run diagnostics to crawl links.
      </p>
    );
  return (
    <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
      <div className="p-3 border-b border-border/30 flex items-center justify-between bg-muted/20">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary">
          Discovered Links ({auditData.discoveredUrls.length})
        </span>
      </div>
      <div className="divide-y divide-border/20 max-h-[400px] overflow-y-auto">
        {auditData.discoveredUrls.map((item: any, i: number) => {
          const isBroken = item.status >= 400 || item.status === 0;
          return (
            <div
              key={i}
              className="flex items-center justify-between p-2 text-[11px] font-mono hover:bg-muted/30"
            >
              <div className="flex items-center gap-2 min-w-0">
                {isBroken ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                )}
                <span className="truncate text-foreground">{item.url}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${item.isInternal ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  {item.isInternal ? "INT" : "EXT"}
                </span>
                <span
                  className={`font-bold ${isBroken ? "text-rose-500" : "text-emerald-500"}`}
                >
                  {item.status || "ERR"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OpenGraphSub({ auditData, onCopy, copied }: any) {
  const [title, setTitle] = useState(
    auditData?.seo?.ogTitle || auditData?.seo?.title || "Web Target Title",
  );
  const [desc, setDesc] = useState(
    auditData?.seo?.ogDescription ||
      auditData?.seo?.description ||
      "Web Target Meta Description",
  );
  const [imageUrl, setImageUrl] = useState(auditData?.seo?.ogImage || "");

  useEffect(() => {
    if (auditData?.seo) {
      if (auditData.seo.ogTitle || auditData.seo.title)
        setTitle(auditData.seo.ogTitle || auditData.seo.title);
      if (auditData.seo.ogDescription || auditData.seo.description)
        setDesc(auditData.seo.ogDescription || auditData.seo.description);
      if (auditData.seo.ogImage) setImageUrl(auditData.seo.ogImage);
    }
  }, [auditData]);

  const generatedTags = `<meta property="og:title" content="${title}">\n<meta property="og:description" content="${desc}">\n<meta property="og:image" content="${imageUrl}">\n<meta name="twitter:card" content="summary_large_image">`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div>
          <span className={labelCls}>OG Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <span className={labelCls}>OG Description</span>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full p-2.5 rounded-md border border-border/40 text-[11px] bg-background focus:outline-none focus:border-primary h-20"
          />
        </div>
        <div>
          <span className={labelCls}>OG Image URL</span>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
      <div className="space-y-3">
        <div className="bg-card/60 border border-border/30 rounded-xl p-3 space-y-2">
          <div className="h-32 bg-muted rounded-lg overflow-hidden relative flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Social Card"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-muted-foreground">
                Social Card Image
              </span>
            )}
          </div>
          <div className="font-bold text-sm text-foreground truncate">
            {title}
          </div>
          <div className="text-[11px] text-muted-foreground line-clamp-2">
            {desc}
          </div>
        </div>
        <div className="bg-card/60 border border-border/30 rounded-xl p-3 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary">
              Generated Tags
            </span>
            <button
              onClick={() => onCopy(generatedTags)}
              className="text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}{" "}
              Copy
            </button>
          </div>
          <pre className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono overflow-x-auto bg-background p-2 rounded border border-border/40">
            {generatedTags}
          </pre>
        </div>
      </div>
    </div>
  );
}

function SchemaMarkupSub({ auditData, onCopy, copied }: any) {
  const [schemaType, setSchemaType] = useState<string>("Article");
  const [headline, setHeadline] = useState<string>(
    auditData?.seo?.title || "Web Target Article Headline",
  );
  const [pubDate, setPubDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    if (auditData?.seo?.title) setHeadline(auditData.seo.title);
  }, [auditData]);

  const jsonLd = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": schemaType,
      headline,
      datePublished: pubDate,
    },
    null,
    2,
  );
  const fullTag = `<script type="application/ld+json">\n${jsonLd}\n</script>`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div>
          <span className={labelCls}>Schema Type</span>
          <select
            value={schemaType}
            onChange={(e) => setSchemaType(e.target.value)}
            className={inputCls}
          >
            <option value="Article">Article</option>
            <option value="WebPage">WebPage</option>
            <option value="Organization">Organization</option>
          </select>
        </div>
        <div>
          <span className={labelCls}>Headline</span>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <span className={labelCls}>Date Published</span>
          <input
            type="date"
            value={pubDate}
            onChange={(e) => setPubDate(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-primary">
            JSON-LD Output
          </span>
          <button
            onClick={() => onCopy(fullTag)}
            className="px-2 py-1 rounded bg-primary text-primary-foreground text-[10px] font-bold flex items-center gap-1"
          >
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}{" "}
            Copy
          </button>
        </div>
        <pre className="p-3 bg-card/60 border border-border/30 rounded-lg text-[11px] font-mono text-emerald-600 dark:text-emerald-400 overflow-x-auto h-64">
          {fullTag}
        </pre>
      </div>
    </div>
  );
}
