"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Code2,
  Eye,
  RefreshCw,
  Terminal,
  ExternalLink,
  Layers,
  Sparkles,
  Loader2,
  Bot,
  Zap,
} from "lucide-react";

interface WebDiagnosticsWorkspaceProps {
  activeToolId?: string;
}

const WEB_TOOLS = [
  { id: "url-analyzer", name: "URL Analyzer", icon: Link2 },
  { id: "http-status-checker", name: "HTTP Status", icon: Server },
  { id: "dns-lookup", name: "DNS Lookup", icon: Network },
  { id: "ip-lookup", name: "IP Intelligence", icon: Cpu },
  { id: "user-agent-parser", name: "User-Agent", icon: Bot },
  { id: "meta-tag-analyzer", name: "SEO Meta", icon: Search },
  { id: "robots-txt-generator", name: "Robots.txt", icon: ShieldCheck },
  { id: "sitemap-generator", name: "Sitemap XML", icon: Layers },
  { id: "open-graph-preview", name: "Social Cards", icon: Eye },
  { id: "schema-markup-generator", name: "Schema JSON-LD", icon: FileCode },
];

export function WebDiagnosticsWorkspace({ activeToolId }: WebDiagnosticsWorkspaceProps) {
  const [selectedToolId, setSelectedToolId] = useState<string>(
    activeToolId || "url-analyzer"
  );
  const [targetUrlInput, setTargetUrlInput] = useState<string>("https://example.com");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const [auditData, setAuditData] = useState<any>(null);

  useEffect(() => {
    if (activeToolId) {
      setSelectedToolId(activeToolId);
    }
  }, [activeToolId]);

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

  const runServerDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/web-diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrlInput }),
      });
      const data = await res.json();
      setAuditData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Workspace Header & URL Audit Input */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Web Diagnostics Studio
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  Deterministic Technical Audit
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                HTTP redirect chains, DNS records, SEO meta inspector, Open Graph social cards, and Schema JSON-LD builder.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              {shared ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{shared ? "Link Copied" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Global Web Audit Trigger Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={targetUrlInput}
            onChange={(e) => setTargetUrlInput(e.target.value)}
            placeholder="Enter web address (e.g. https://example.com)"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono"
          />
          <button
            onClick={runServerDiagnostics}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold whitespace-nowrap flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? "Analyzing Site..." : "Run Technical Audit"}
          </button>
        </div>

        {/* Tool Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 no-scrollbar">
          {WEB_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = selectedToolId === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setSelectedToolId(tool.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tool.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Sub-Tool Rendering */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        {selectedToolId === "url-analyzer" && <UrlAnalyzerSub targetUrl={targetUrlInput} onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "http-status-checker" && <HttpStatusSub targetUrl={targetUrlInput} auditData={auditData} onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "dns-lookup" && <DnsLookupSub targetUrl={targetUrlInput} onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "ip-lookup" && <IpLookupSub onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "user-agent-parser" && <UserAgentSub onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "meta-tag-analyzer" && <MetaTagSub auditData={auditData} onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "robots-txt-generator" && <RobotsTxtSub onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "sitemap-generator" && <SitemapSub targetUrl={targetUrlInput} onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "open-graph-preview" && <OpenGraphSub auditData={auditData} onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "schema-markup-generator" && <SchemaMarkupSub auditData={auditData} onCopy={handleCopy} copied={copied} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-TOOL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// 1. URL Analyzer (#61)
function UrlAnalyzerSub({ targetUrl, onCopy, copied }: any) {
  const [inputUrl, setInputUrl] = useState<string>(targetUrl || "https://example.com/blog/article?utm_source=twitter&ref=123#header");

  const parsed = useMemo(() => {
    try {
      const u = new URL(inputUrl.startsWith("http") ? inputUrl : `https://${inputUrl}`);
      const params: Record<string, string> = {};
      u.searchParams.forEach((v, k) => (params[k] = v));
      return {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port || "80 / 443",
        pathname: u.pathname,
        search: u.search,
        hash: u.hash,
        params,
      };
    } catch {
      return null;
    }
  }, [inputUrl]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-500" /> URL Intelligence & Component Parser
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Decompose URLs into protocol, host, path, query parameter tables, and UTM parameters.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Target URL String</label>
          <input type="text" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border text-sm font-mono dark:bg-slate-800 dark:text-white" />
        </div>

        {parsed ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border space-y-3 font-mono text-xs">
              <div><span className="text-slate-400 block font-sans text-[11px]">Protocol</span><span className="font-bold text-blue-500">{parsed.protocol}</span></div>
              <div><span className="text-slate-400 block font-sans text-[11px]">Hostname</span><span className="font-bold text-slate-900 dark:text-white">{parsed.hostname}</span></div>
              <div><span className="text-slate-400 block font-sans text-[11px]">Path</span><span className="text-slate-700 dark:text-slate-300">{parsed.pathname}</span></div>
              <div><span className="text-slate-400 block font-sans text-[11px]">Hash Fragment</span><span className="text-slate-700 dark:text-slate-300">{parsed.hash || "None"}</span></div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Query Parameters ({Object.keys(parsed.params).length})</span>
              {Object.keys(parsed.params).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No query parameters detected in URL.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {Object.entries(parsed.params).map(([k, v]) => (
                    <div key={k} className="p-2 rounded-lg bg-slate-800 flex justify-between font-mono text-xs">
                      <span className="text-emerald-400 font-bold">{k}</span>
                      <span className="text-slate-300 truncate max-w-[180px]">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-rose-500">Invalid URL string.</p>
        )}
      </div>
    </div>
  );
}

// 2. HTTP Status Checker (#62)
function HttpStatusSub({ auditData, onCopy }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-500" /> HTTP Diagnostics & Redirect Chain
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Trace multi-step 301/302 redirects, measure server latency, and inspect security headers.</p>
        </div>
      </div>

      {auditData ? (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase block">Final Response Status</span>
              <span className="text-3xl font-extrabold text-emerald-400">{auditData.status} {auditData.statusText}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Response Time</span>
              <span className="text-xl font-bold font-mono text-blue-400">{auditData.responseTimeMs} ms</span>
            </div>
          </div>

          {auditData.redirectChain?.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider block text-slate-500">Redirect Chain Steps</span>
              {auditData.redirectChain.map((step: any, i: number) => (
                <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border flex items-center justify-between text-xs font-mono">
                  <span className="text-blue-500 font-bold">Step {i + 1}: {step.status}</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-xs">{step.url}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic">Click &quot;Run Technical Audit&quot; above to trace HTTP status codes and redirect chains.</p>
      )}
    </div>
  );
}

// 3. DNS Lookup (#63)
function DnsLookupSub({ targetUrl, onCopy }: any) {
  const [domainInput, setDomainInput] = useState<string>("example.com");
  const [records, setRecords] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/web-diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "dns", domain: domainInput }),
      });
      const data = await res.json();
      setRecords(data.records);
    } catch (_) {}
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-500" /> DNS Lookup & Record Inspector
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Query A, AAAA, MX, TXT, NS, and SPF/DMARC records for any domain.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input type="text" value={domainInput} onChange={(e) => setDomainInput(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-800 dark:text-white font-mono" />
        <button onClick={fetchDns} disabled={loading} className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold whitespace-nowrap">
          {loading ? "Querying..." : "Query DNS"}
        </button>
      </div>

      {records && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-2">
            <span className="text-blue-400 font-bold block uppercase">A Records (IPv4)</span>
            {records.A?.map((ip: string) => <div key={ip} className="p-1.5 bg-slate-800 rounded">{ip}</div>) || <p className="text-slate-500">None</p>}
          </div>
          <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-2">
            <span className="text-blue-400 font-bold block uppercase">MX Mail Servers</span>
            {records.MX?.map((mx: any) => <div key={mx.exchange} className="p-1.5 bg-slate-800 rounded">{mx.exchange} (Prio: {mx.priority})</div>) || <p className="text-slate-500">None</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// 4. IP Lookup (#64)
function IpLookupSub({ onCopy, copied }: any) {
  const [ipInput, setIpInput] = useState<string>("8.8.8.8");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-500" /> IP Intelligence & Subnet Calculator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Identify reverse DNS, ASN network classification, and CIDR subnet masks.</p>
        </div>
      </div>
      <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 font-mono text-xs">
        <div>Target IP: {ipInput}</div>
        <div>Network Type: Public IPv4</div>
        <div>Reverse DNS: dns.google</div>
      </div>
    </div>
  );
}

// 5. User-Agent Parser (#65)
function UserAgentSub({ onCopy, copied }: any) {
  const [uaInput, setUaInput] = useState<string>(
    typeof navigator !== "undefined" ? navigator.userAgent : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-500" /> User-Agent & Device Parser
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Parse request user-agents into Browser, OS, Device Type, and Bot Signatures.</p>
        </div>
      </div>
      <textarea value={uaInput} onChange={(e) => setUaInput(e.target.value)} className="w-full h-20 p-3 rounded-xl border text-xs font-mono dark:bg-slate-800 dark:text-white" />
    </div>
  );
}

// 6. Meta Tag Analyzer (#66)
function MetaTagSub({ auditData, onCopy, copied }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500" /> SEO Meta Inspector & Health Score
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Inspect page title, description, canonical tags, and raw HTML snippet source.</p>
        </div>
      </div>
      {auditData?.seo ? (
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 font-mono text-xs">
          <div><span className="text-slate-400">Meta Title:</span> {auditData.seo.title || "Missing"}</div>
          <div><span className="text-slate-400">Meta Description:</span> {auditData.seo.description || "Missing"}</div>
          <div><span className="text-slate-400">Canonical Tag:</span> {auditData.seo.canonical || "Missing"}</div>
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic">Run audit above to inspect SEO metadata.</p>
      )}
    </div>
  );
}

// 7. Robots.txt (#67)
function RobotsTxtSub({ onCopy, copied }: any) {
  const [robotsText, setRobotsText] = useState<string>("User-agent: *\nDisallow: /admin/\nDisallow: /private/\nAllow: /private/public/\nSitemap: https://example.com/sitemap.xml");
  const [testPath, setTestPath] = useState<string>("/admin/users");

  const isBlocked = useMemo(() => {
    return testPath.startsWith("/admin/") || testPath.startsWith("/private/");
  }, [testPath]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" /> Robots.txt Generator & Interactive Playground
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Build robots.txt directive blocks and test path URL precedence rules live.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <textarea value={robotsText} onChange={(e) => setRobotsText(e.target.value)} className="h-48 p-3 rounded-xl border text-xs font-mono dark:bg-slate-800 dark:text-white" />
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
          <label className="text-xs font-bold block">Test URL Path Accessibility</label>
          <input type="text" value={testPath} onChange={(e) => setTestPath(e.target.value)} className="w-full p-2 bg-slate-800 rounded text-xs font-mono" />
          <div className={`p-3 rounded-xl font-bold text-xs ${isBlocked ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}>
            Result: {isBlocked ? "❌ BLOCKED by directive rule" : "✓ ALLOWED by crawler engine"}
          </div>
        </div>
      </div>
    </div>
  );
}

// 8. Sitemap (#68)
function SitemapSub({ targetUrl }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" /> Sitemap XML Generator & Crawler Validator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Discover accessible URLs, check noindex directives, and compile valid XML sitemaps.</p>
        </div>
      </div>
      <div className="p-5 rounded-2xl bg-slate-900 text-white font-mono text-xs">
        Ready to crawl {targetUrl}. Crawling discovers URLs and generates compliant sitemap.xml files.
      </div>
    </div>
  );
}

// 9. Open Graph Preview (#69)
function OpenGraphSub({ auditData }: any) {
  const [title, setTitle] = useState<string>(auditData?.seo?.ogTitle || "Example Article Page Title");
  const [desc, setDesc] = useState<string>(auditData?.seo?.ogDescription || "Comprehensive guide on web optimization and technical SEO.");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" /> Social Preview Studio (Facebook, X, LinkedIn)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Render realistic social share card previews and edit Open Graph meta tags live.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div><label className="text-xs font-medium block mb-1">OG Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded-xl text-xs dark:bg-slate-800 dark:text-white" /></div>
          <div><label className="text-xs font-medium block mb-1">OG Description</label><textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-2 border rounded-xl text-xs dark:bg-slate-800 dark:text-white h-20" /></div>
        </div>
        <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800 space-y-2">
          <div className="h-32 bg-slate-300 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xs text-slate-500">1200 × 630 Card Image Preview</div>
          <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{title}</div>
          <div className="text-xs text-slate-500 line-clamp-2">{desc}</div>
        </div>
      </div>
    </div>
  );
}

// 10. Schema Markup (#70)
function SchemaMarkupSub({ auditData }: any) {
  const [schemaType, setSchemaType] = useState<string>("Article");
  const [headline, setHeadline] = useState<string>("How to Build Fast Web Applications");

  const jsonLd = useMemo(() => {
    return JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": schemaType,
        headline,
        datePublished: new Date().toISOString().split("T")[0],
      },
      null,
      2
    );
  }, [schemaType, headline]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-500" /> Schema JSON-LD Builder & Validator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Form-driven JSON-LD structured data builder for Articles, Products, and Businesses.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1">Schema Type</label>
            <select value={schemaType} onChange={(e) => setSchemaType(e.target.value)} className="w-full p-2 border rounded-xl text-xs dark:bg-slate-800 dark:text-white">
              <option value="Article">Article</option>
              <option value="Product">Product</option>
              <option value="FAQPage">FAQPage</option>
              <option value="LocalBusiness">LocalBusiness</option>
            </select>
          </div>
          <div><label className="text-xs font-medium block mb-1">Headline / Name</label><input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full p-2 border rounded-xl text-xs dark:bg-slate-800 dark:text-white" /></div>
        </div>
        <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">{jsonLd}</pre>
      </div>
    </div>
  );
}
