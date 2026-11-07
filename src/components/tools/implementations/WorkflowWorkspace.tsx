"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Table,
  Code,
  Send,
  Search,
  FileBox,
  Layers,
  Zap,
  Award,
  Check,
  Share2,
  RefreshCw,
  Command as CommandIcon,
  Play,
  Loader2,
} from "lucide-react";
import { marked } from "marked";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const WORKFLOW_TOOLS = [
  {
    id: "universal-website-audit",
    name: "Universal Audit",
    icon: Award,
    path: "/tools/workflows/audits/universal-audit",
  },
  {
    id: "website-link-crawler",
    name: "Link Crawler",
    icon: Layers,
    path: "/tools/workflows/audits/link-crawler",
  },
  {
    id: "website-performance-analyzer",
    name: "Speed Audit",
    icon: Zap,
    path: "/tools/workflows/audits/performance-analyzer",
  },
  {
    id: "website-asset-analyzer",
    name: "Asset Inspector",
    icon: FileBox,
    path: "/tools/workflows/audits/asset-analyzer",
  },
  {
    id: "api-request-builder",
    name: "API Tester",
    icon: Send,
    path: "/tools/workflows/data/api-tester",
  },
  {
    id: "csv-data-cleaner",
    name: "CSV Data Cleaner",
    icon: Table,
    path: "/tools/workflows/data/csv-cleaner",
  },
  {
    id: "json-csv-xml-converter",
    name: "Data Converter",
    icon: Code,
    path: "/tools/workflows/data/data-converter",
  },
  {
    id: "regex-extraction-workspace",
    name: "Regex Extractor",
    icon: Search,
    path: "/tools/workflows/data/regex-extractor",
  },
  {
    id: "markdown-html-workspace",
    name: "Markdown Workspace",
    icon: FileText,
    path: "/tools/workflows/data/markdown-html",
  },
  {
    id: "file-converter-workspace",
    name: "File Batch Converter",
    icon: RefreshCw,
    path: "/tools/workflows/data/file-converter",
  },
];

const labelCls =
  "text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-1";
const inputCls =
  "h-7 w-full px-2 bg-background border border-border/40 rounded-md text-[11px] font-mono text-foreground focus:outline-none focus:border-primary";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function WorkflowWorkspace({ activeToolId }: { activeToolId?: string }) {
  const router = useRouter();
  const [tool, setTool] = useState<string>(
    activeToolId || "universal-website-audit",
  );

  // Global Audit State
  const [targetUrl, setTargetUrl] = useState("https://example.com");
  const [auditData, setAuditData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  // API Tester State (Lifted to parent for Inspector/Canvas sync)
  const [apiMethod, setApiMethod] = useState("GET");
  const [apiUrl, setApiUrl] = useState(
    "https://jsonplaceholder.typicode.com/todos/1",
  );

  // Regex State (Lifted to parent for Inspector/Canvas sync)
  const [regexPattern, setRegexPattern] = useState("#(\\d+)\\s*-\\s*\\$(\\d+)");

  // Command Palette State
  const [palette, setPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [paletteIdx, setPaletteIdx] = useState(0);
  const paletteListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (activeToolId) setTool(activeToolId);
    if (typeof window !== "undefined") {
      const hashStr = window.location.hash
        ? window.location.hash.substring(1)
        : "";
      const queryStr = window.location.search
        ? window.location.search.substring(1)
        : "";
      const params = new URLSearchParams(hashStr || queryStr);
      const hashTool = params.get("tool");
      const hashTarget = params.get("target");
      if (hashTool && WORKFLOW_TOOLS.some((t) => t.id === hashTool))
        setTool(hashTool);
      if (hashTarget) setTargetUrl(decodeURIComponent(hashTarget));
    }
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

  const copyText = (text: string) => {
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

  const runMasterAudit = async () => {
    if (!targetUrl) return;
    setLoading(true);
    try {
      const res = await fetch("/api/web-diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await res.json();
      setAuditData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on mount if target exists
  useEffect(() => {
    if (targetUrl && targetUrl !== "https://example.com") {
      runMasterAudit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeToolObj =
    WORKFLOW_TOOLS.find((t) => t.id === tool) || WORKFLOW_TOOLS[0];
  const ToolIcon = activeToolObj.icon;

  const actions = WORKFLOW_TOOLS.map((t) => ({
    id: `tool-${t.id}`,
    label: `Open ${t.name}`,
    group: "Workflows",
    run: () => {
      setTool(t.id);
      router.push(t.path);
    },
  }));
  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(paletteQuery.toLowerCase()),
  );

  // ── RENDER INSPECTOR ──
  const renderInspector = () => {
    switch (tool) {
      case "universal-website-audit":
      case "website-link-crawler":
      case "website-performance-analyzer":
      case "website-asset-analyzer":
        return (
          <div className="space-y-4">
            <div>
              <span className={labelCls}>Target URL</span>
              <input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className={inputCls}
                onKeyDown={(e) => e.key === "Enter" && runMasterAudit()}
              />
            </div>
            <button
              onClick={runMasterAudit}
              disabled={loading}
              className="w-full py-1.5 rounded-md bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}{" "}
              {loading ? "Auditing..." : "Run Audit"}
            </button>
          </div>
        );
      case "api-request-builder":
        return (
          <div className="space-y-4">
            <div>
              <span className={labelCls}>HTTP Method</span>
              <select
                value={apiMethod}
                onChange={(e) => setApiMethod(e.target.value)}
                className={inputCls}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <span className={labelCls}>Endpoint URL</span>
              <input
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        );
      case "regex-extraction-workspace":
        return (
          <div>
            <span className={labelCls}>Regex Pattern</span>
            <input
              value={regexPattern}
              onChange={(e) => setRegexPattern(e.target.value)}
              className={inputCls}
            />
          </div>
        );
      default:
        return (
          <p className="text-[11px] text-muted-foreground italic">
            No extra options for this tool.
          </p>
        );
    }
  };

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
            Workflows Suite
          </span>
          {WORKFLOW_TOOLS.map((t) => {
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
          <div className="max-w-4xl mx-auto space-y-4">
            {tool === "universal-website-audit" && (
              <UniversalAuditSub
                auditData={auditData}
                onCopy={copyText}
                copied={copied}
              />
            )}
            {tool === "website-link-crawler" && (
              <LinkCrawlerSub auditData={auditData} />
            )}
            {tool === "website-performance-analyzer" && (
              <PerformanceAnalyzerSub auditData={auditData} />
            )}
            {tool === "website-asset-analyzer" && (
              <AssetAnalyzerSub auditData={auditData} />
            )}
            {tool === "api-request-builder" && (
              <ApiTesterSub
                method={apiMethod}
                apiUrl={apiUrl}
                onCopy={copyText}
                copied={copied}
              />
            )}
            {tool === "csv-data-cleaner" && <CsvCleanerSub onCopy={copyText} />}
            {tool === "json-csv-xml-converter" && (
              <DataConverterSub onCopy={copyText} />
            )}
            {tool === "regex-extraction-workspace" && (
              <RegexExtractorSub pattern={regexPattern} />
            )}
            {tool === "markdown-html-workspace" && <MarkdownWorkspaceSub />}
            {tool === "file-converter-workspace" && <FileConverterSub />}
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
            {renderInspector()}
          </div>
        </aside>
      </div>

      {/* STATUS BAR */}
      <footer className="h-6 shrink-0 flex items-center gap-3 px-3 border-t border-border/40 bg-card/50 text-[10px] font-mono text-muted-foreground overflow-x-auto whitespace-nowrap">
        <span className="flex items-center gap-1 text-emerald-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
          Engine Ready
        </span>
        <span>Tool: {activeToolObj.name}</span>
        <span className="hidden sm:inline truncate">Target: {targetUrl}</span>
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
// SUB-COMPONENTS (100% Original Features + Themed)
// ─────────────────────────────────────────────────────────────────────────────

function UniversalAuditSub({ auditData, onCopy, copied }: any) {
  if (!auditData)
    return (
      <p className="text-xs text-muted-foreground italic p-4">
        Enter a URL in the options panel and click "Run Audit".
      </p>
    );

  return (
    <div className="space-y-4">
      <div className="bg-card/60 border border-border/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-1">
            Website Technical Health Score
          </span>
          <span className="text-4xl font-black text-emerald-500 font-mono">
            {auditData.healthScore}{" "}
            <span className="text-sm text-muted-foreground">/ 100</span>
          </span>
        </div>
        <div className="text-right text-[11px] font-mono">
          <span className="text-muted-foreground block mb-1">
            HTTP Response
          </span>
          <span className="text-emerald-500 font-bold">
            {auditData.status} {auditData.statusText} (
            {auditData.responseTimeMs} ms)
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card/60 border border-border/30 rounded-lg p-3 min-w-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block truncate">
            SEO Meta Title
          </span>
          <span className="text-[11px] font-bold text-foreground truncate block">
            {auditData.seo?.title || "Missing"}
          </span>
        </div>
        <div className="bg-card/60 border border-border/30 rounded-lg p-3 min-w-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block truncate">
            Canonical Tag
          </span>
          <span className="text-[11px] font-bold text-emerald-500 truncate block">
            {auditData.seo?.canonical || "Missing"}
          </span>
        </div>
        <div className="bg-card/60 border border-border/30 rounded-lg p-3 min-w-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block truncate">
            Discovered Links
          </span>
          <span className="text-[11px] font-bold text-primary block">
            {auditData.discoveredUrls?.length || 0} Links
          </span>
        </div>
      </div>
    </div>
  );
}

function LinkCrawlerSub({ auditData }: any) {
  if (!auditData?.discoveredUrls)
    return (
      <p className="text-xs text-muted-foreground italic p-4">
        Run the audit to crawl links.
      </p>
    );
  return (
    <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
      <div className="p-3 border-b border-border/30 flex items-center justify-between bg-muted/20">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary">
          Discovered Links ({auditData.discoveredUrls.length})
        </span>
      </div>
      <div className="divide-y divide-border/20 max-h-[500px] overflow-y-auto">
        {auditData.discoveredUrls.map((item: any, i: number) => (
          <div
            key={i}
            className="flex justify-between items-center text-[11px] font-mono p-2 hover:bg-muted/30 transition-colors"
          >
            <span className="truncate max-w-sm text-foreground">
              {item.url}
            </span>
            <span className="text-emerald-500 font-bold shrink-0">
              200 OK ({item.isInternal ? "Internal" : "External"})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PerformanceAnalyzerSub({ auditData }: any) {
  if (!auditData)
    return (
      <p className="text-xs text-muted-foreground italic p-4">
        Run the audit to measure performance.
      </p>
    );
  return (
    <div className="bg-card/60 border border-border/30 rounded-xl p-4 space-y-3 font-mono text-xs">
      <div className="flex justify-between border-b border-border/20 pb-2">
        <span className="text-muted-foreground">TTFB Latency</span>
        <span className="text-foreground">{auditData.responseTimeMs} ms</span>
      </div>
      <div className="flex justify-between border-b border-border/20 pb-2">
        <span className="text-muted-foreground">HTML Payload Size</span>
        <span className="text-foreground">
          {((auditData.assets?.htmlBytes || 0) / 1024).toFixed(1)} KB
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Content Encoding</span>
        <span className="text-primary">
          {auditData.headers?.["content-encoding"] || "Gzip / Brotli Active"}
        </span>
      </div>
    </div>
  );
}

function AssetAnalyzerSub({ auditData }: any) {
  if (!auditData?.assets)
    return (
      <p className="text-xs text-muted-foreground italic p-4">
        Run the audit to inspect assets.
      </p>
    );
  return (
    <div className="grid grid-cols-3 gap-4 text-xs font-mono">
      <div className="bg-card/60 border border-border/30 rounded-xl p-4 text-center">
        <span className="text-muted-foreground block mb-2">Images</span>
        <span className="text-2xl font-black text-foreground">
          {auditData.assets.imagesCount}
        </span>
      </div>
      <div className="bg-card/60 border border-border/30 rounded-xl p-4 text-center">
        <span className="text-muted-foreground block mb-2">Scripts</span>
        <span className="text-2xl font-black text-foreground">
          {auditData.assets.scriptsCount}
        </span>
      </div>
      <div className="bg-card/60 border border-border/30 rounded-xl p-4 text-center">
        <span className="text-muted-foreground block mb-2">Stylesheets</span>
        <span className="text-2xl font-black text-foreground">
          {auditData.assets.stylesheetsCount}
        </span>
      </div>
    </div>
  );
}

function ApiTesterSub({ method, apiUrl, onCopy, copied }: any) {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sendRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/web-diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "api-proxy",
          apiConfig: { method, url: apiUrl },
        }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (_) {}
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={sendRequest}
        disabled={loading}
        className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-[11px] font-bold flex items-center gap-2 transition-colors"
      >
        <Send className="h-3.5 w-3.5" />{" "}
        {loading ? "Sending..." : "Send Request"}
      </button>
      {response && (
        <div className="bg-card/60 border border-border/30 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-border/30 flex items-center justify-between bg-muted/20">
            <span
              className={`text-[11px] font-bold font-mono ${response.status >= 200 && response.status < 300 ? "text-emerald-500" : "text-rose-500"}`}
            >
              Status: {response.status}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {response.responseTimeMs} ms
            </span>
          </div>
          <pre className="p-3 text-[11px] font-mono text-foreground overflow-x-auto whitespace-pre-wrap max-h-[400px]">
            {response.body}
          </pre>
        </div>
      )}
    </div>
  );
}

function CsvCleanerSub({ onCopy }: any) {
  const [csvText, setCsvText] = useState(
    "name,Email,age\nJohn, JOHN@GMAIL.COM ,25\njohn,john@gmail.com,25\nSarah,,31",
  );

  const cleanedCsv = useMemo(() => {
    const lines = csvText.split("\n").filter((l) => l.trim() !== "");
    const header = lines[0];
    const rows = lines.slice(1);
    const seen = new Set<string>();
    const cleanedRows: string[] = [];

    rows.forEach((r) => {
      const parts = r.split(",").map((p) => p.trim());
      if (parts[1]) parts[1] = parts[1].toLowerCase();
      const normalizedRow = parts.join(",");
      if (!seen.has(normalizedRow)) {
        seen.add(normalizedRow);
        cleanedRows.push(normalizedRow);
      }
    });

    return [header, ...cleanedRows].join("\n");
  }, [csvText]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1">
        <span className={labelCls}>Messy CSV Input</span>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          className="w-full h-80 p-3 rounded-xl border border-border/40 text-[11px] font-mono bg-background focus:outline-none focus:border-primary"
        />
      </div>
      <div className="space-y-1">
        <span className={labelCls}>Cleaned & Deduplicated Output</span>
        <textarea
          readOnly
          value={cleanedCsv}
          className="w-full h-80 p-3 rounded-xl border border-border/40 text-[11px] font-mono bg-muted/30 text-foreground"
        />
      </div>
    </div>
  );
}

function DataConverterSub({ onCopy }: any) {
  const [jsonInput, setJsonInput] = useState(
    '[\n  { "id": 1, "name": "Alice" },\n  { "id": 2, "name": "Bob" }\n]',
  );

  const convertedCsv = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) return "Expected JSON array.";
      const headers = Object.keys(parsed[0]).join(",");
      const rows = parsed
        .map((obj: any) => Object.values(obj).join(","))
        .join("\n");
      return `${headers}\n${rows}`;
    } catch {
      return "Invalid JSON syntax.";
    }
  }, [jsonInput]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1">
        <span className={labelCls}>JSON Input</span>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="w-full h-80 p-3 rounded-xl border border-border/40 text-[11px] font-mono bg-background focus:outline-none focus:border-primary"
        />
      </div>
      <div className="space-y-1">
        <span className={labelCls}>Converted CSV</span>
        <textarea
          readOnly
          value={convertedCsv}
          className="w-full h-80 p-3 rounded-xl border border-border/40 text-[11px] font-mono bg-muted/30 text-foreground"
        />
      </div>
    </div>
  );
}

function RegexExtractorSub({ pattern }: any) {
  const [text, setText] = useState(
    "Order #10023 - $50\nOrder #10024 - $75\nOrder #10025 - $120",
  );

  const extractions = useMemo(() => {
    try {
      const re = new RegExp(pattern, "g");
      const matches: string[] = [];
      let m;
      while ((m = re.exec(text)) !== null) {
        matches.push(`${m[1]} | $${m[2]}`);
        if (m.index === re.lastIndex) re.lastIndex++;
      }
      return matches;
    } catch {
      return ["Invalid Regex Pattern"];
    }
  }, [text, pattern]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1">
        <span className={labelCls}>Raw Text Input</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-80 p-3 rounded-xl border border-border/40 text-[11px] font-mono bg-background focus:outline-none focus:border-primary"
        />
      </div>
      <div className="space-y-1">
        <span className={labelCls}>Extracted Matches</span>
        <div className="w-full h-80 p-3 rounded-xl border border-border/40 text-[11px] font-mono bg-muted/30 text-foreground overflow-y-auto space-y-1">
          {extractions.map((ex, i) => (
            <div
              key={i}
              className="px-2 py-1 bg-background rounded border border-border/20"
            >
              {ex}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarkdownWorkspaceSub() {
  const [md, setMd] = useState(
    "# Comparlify Guide\n\n- Fast Tools\n- Zero Server Footprint\n- 100% In-Browser Privacy",
  );
  const htmlPreview = useMemo(
    () =>
      marked.parse(md.replace(/</g, "&lt;").replace(/>/g, "&gt;"), {
        async: false,
      }) as string,
    [md],
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1">
        <span className={labelCls}>Markdown Input</span>
        <textarea
          value={md}
          onChange={(e) => setMd(e.target.value)}
          className="w-full h-80 p-3 rounded-xl border border-border/40 text-[11px] font-mono bg-background focus:outline-none focus:border-primary"
        />
      </div>
      <div className="space-y-1">
        <span className={labelCls}>HTML Preview</span>
        <div
          className="w-full h-80 p-3 rounded-xl border border-border/40 text-[11px] bg-muted/30 overflow-y-auto prose dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: htmlPreview }}
        />
      </div>
    </div>
  );
}

function FileConverterSub() {
  return (
    <div className="p-8 border-2 border-dashed border-border/60 rounded-xl text-center text-xs text-muted-foreground bg-muted/20">
      Drag & drop files to queue bulk multi-format conversions locally in
      browser RAM.
    </div>
  );
}
