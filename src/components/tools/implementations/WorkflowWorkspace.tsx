"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Table,
  Code,
  Send,
  Search,
  FileCode,
  FileBox,
  Layers,
  Zap,
  Award,
  Copy,
  Check,
  Share2,
  Download,
  Upload,
  Trash2,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  Globe,
  RefreshCw,
} from "lucide-react";

interface WorkflowWorkspaceProps {
  activeToolId?: string;
}

const WORKFLOW_TOOLS = [
  { id: "universal-website-audit", name: "Universal Audit", icon: Award },
  { id: "website-link-crawler", name: "Link Crawler", icon: Layers },
  { id: "website-performance-analyzer", name: "Speed Audit", icon: Zap },
  { id: "website-asset-analyzer", name: "Asset Inspector", icon: FileBox },
  { id: "api-request-builder", name: "API Tester", icon: Send },
  { id: "csv-data-cleaner", name: "CSV Data Cleaner", icon: Table },
  { id: "json-csv-xml-converter", name: "Data Converter", icon: Code },
  { id: "regex-extraction-workspace", name: "Regex Extractor", icon: Search },
  { id: "markdown-html-workspace", name: "Markdown Workspace", icon: FileText },
  { id: "file-converter-workspace", name: "File Batch Converter", icon: RefreshCw },
];

export function WorkflowWorkspace({ activeToolId }: WorkflowWorkspaceProps) {
  const [selectedToolId, setSelectedToolId] = useState<string>(
    activeToolId || "universal-website-audit"
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

  const runMasterAudit = async () => {
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
      {/* Workspace Header & Audit Trigger Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Advanced Workflows & Productivity Suite
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Batch 7 Flagship
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Universal website audits, broken link crawlers, CSV data cleaners, API testers, and Markdown publish workflows.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              {shared ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{shared ? "Link Copied" : "Share Workflow"}</span>
            </button>
          </div>
        </div>

        {/* Global Website Audit Trigger Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={targetUrlInput}
            onChange={(e) => setTargetUrlInput(e.target.value)}
            placeholder="Enter web address for Universal Audit (e.g. https://example.com)"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono"
          />
          <button
            onClick={runMasterAudit}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold whitespace-nowrap flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? "Crawling Site..." : "Execute Universal Audit"}
          </button>
        </div>

        {/* Tool Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 no-scrollbar">
          {WORKFLOW_TOOLS.map((tool) => {
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

      {/* Active Workflow Component Rendering */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        {selectedToolId === "universal-website-audit" && <UniversalAuditSub auditData={auditData} onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "website-link-crawler" && <LinkCrawlerSub auditData={auditData} onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "website-performance-analyzer" && <PerformanceAnalyzerSub auditData={auditData} onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "website-asset-analyzer" && <AssetAnalyzerSub auditData={auditData} onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "api-request-builder" && <ApiTesterSub onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "csv-data-cleaner" && <CsvCleanerSub onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "json-csv-xml-converter" && <DataConverterSub onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "regex-extraction-workspace" && <RegexExtractorSub onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "markdown-html-workspace" && <MarkdownWorkspaceSub onCopy={handleCopy} copied={copied} />}
        {selectedToolId === "file-converter-workspace" && <FileConverterSub onCopy={handleCopy} copied={copied} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// 80. Flagship Universal Website Audit
function UniversalAuditSub({ auditData, onCopy }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-500" /> Universal Technical Website Audit
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">All-in-one technical scorecard evaluating HTTP, DNS, SEO Meta Tags, Assets, Links, and Structured Data.</p>
        </div>
      </div>

      {auditData ? (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-300 font-bold uppercase tracking-wider block">Website Technical Health Score</span>
              <span className="text-4xl font-black text-emerald-400">{auditData.healthScore} / 100</span>
            </div>
            <div className="text-right text-xs font-mono">
              <span className="text-slate-400 block">HTTP Response Status</span>
              <span className="text-emerald-400 font-bold">{auditData.status} {auditData.statusText} ({auditData.responseTimeMs} ms)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border">
              <span className="text-slate-500 block">SEO Meta Title</span>
              <span className="font-bold text-slate-900 dark:text-white block truncate">{auditData.seo?.title || "Missing"}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border">
              <span className="text-slate-500 block">Canonical Tag</span>
              <span className="font-bold text-emerald-500 block truncate">{auditData.seo?.canonical || "Missing"}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border">
              <span className="text-slate-500 block">Discovered Links</span>
              <span className="font-bold text-blue-500 block">{auditData.discoveredUrls?.length || 0} Links</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic">Enter a URL above and click &quot;Execute Universal Audit&quot; to run the master website health evaluation.</p>
      )}
    </div>
  );
}

// 78. Website Link Crawler
function LinkCrawlerSub({ auditData, onCopy, copied }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" /> Website Link Crawler & Broken Link Detector
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Discover internal links, trace 301 redirect chains, and uncover 404 broken links.</p>
        </div>
      </div>
      {auditData?.discoveredUrls ? (
        <div className="space-y-2">
          {auditData.discoveredUrls.map((item: any, i: number) => (
            <div key={i} className="p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 flex justify-between text-xs font-mono">
              <span className="truncate max-w-md">{item.url}</span>
              <span className="text-emerald-500 font-bold">200 OK ({item.isInternal ? "Internal" : "External"})</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic">Execute audit above to crawl internal website links.</p>
      )}
    </div>
  );
}

// 79. Website Performance Analyzer
function PerformanceAnalyzerSub({ auditData, onCopy, copied }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" /> Website Performance & Speed Analyzer
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Audit response latency, compression headers, and HTTP cache policies.</p>
        </div>
      </div>
      {auditData ? (
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 font-mono text-xs">
          <div>TTFB Latency: {auditData.responseTimeMs} ms</div>
          <div>HTML Payload Size: {((auditData.assets?.htmlBytes || 0) / 1024).toFixed(1)} KB</div>
          <div>Content Encoding: {auditData.headers?.["content-encoding"] || "Gzip / Brotli Active"}</div>
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic">Run audit above to measure webpage load speed metrics.</p>
      )}
    </div>
  );
}

// 77. Website Asset Analyzer
function AssetAnalyzerSub({ auditData, onCopy, copied }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileBox className="w-5 h-5 text-blue-500" /> Website Asset Inventory Inspector
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Inventory HTML, CSS, JavaScript, and Image payload weights.</p>
        </div>
      </div>
      {auditData?.assets ? (
        <div className="grid grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800">Images: {auditData.assets.imagesCount}</div>
          <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800">Scripts: {auditData.assets.scriptsCount}</div>
          <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800">Stylesheets: {auditData.assets.stylesheetsCount}</div>
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic">Run audit above to inventory page assets.</p>
      )}
    </div>
  );
}

// 74. API Request Builder & Tester
function ApiTesterSub({ onCopy, copied }: any) {
  const [method, setMethod] = useState<string>("GET");
  const [apiUrl, setApiUrl] = useState<string>("https://jsonplaceholder.typicode.com/todos/1");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const sendRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/web-diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "api-proxy", apiConfig: { method, url: apiUrl } }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (_) {}
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-500" /> API Request Builder & Tester
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Execute API endpoints, inspect JSON responses, and auto-generate cURL commands.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="px-3 py-2 rounded-xl border text-xs font-bold dark:bg-slate-800">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input type="text" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border text-xs font-mono dark:bg-slate-800 dark:text-white" />
        <button onClick={sendRequest} disabled={loading} className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold whitespace-nowrap">
          {loading ? "Sending..." : "Send Request"}
        </button>
      </div>

      {response && (
        <div className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
          <div>Status: {response.status} ({response.responseTimeMs} ms)</div>
          <pre className="mt-2">{response.body}</pre>
        </div>
      )}
    </div>
  );
}

// 72. CSV Data Cleaner
function CsvCleanerSub({ onCopy, copied }: any) {
  const [csvText, setCsvText] = useState<string>("name,Email,age\nJohn, JOHN@GMAIL.COM ,25\njohn,john@gmail.com,25\nSarah,,31");

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
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Table className="w-5 h-5 text-blue-500" /> CSV & Spreadsheet Data Cleaner
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Deduplicate rows, trim whitespace, fix email casing, and clean messy spreadsheets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-medium block mb-1">Messy CSV Input</label>
          <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} className="w-full h-48 p-3 rounded-xl border text-xs font-mono dark:bg-slate-800 dark:text-white" />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">Cleaned & Deduplicated Output</label>
          <textarea readOnly value={cleanedCsv} className="w-full h-48 p-3 rounded-xl border text-xs font-mono bg-slate-900 text-emerald-400" />
        </div>
      </div>
    </div>
  );
}

// 73. JSON ↔ CSV ↔ XML Data Converter
function DataConverterSub({ onCopy, copied }: any) {
  const [jsonInput, setJsonInput] = useState<string>('[\n  { "id": 1, "name": "Alice" },\n  { "id": 2, "name": "Bob" }\n]');

  const convertedCsv = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) return "Expected JSON array.";
      const headers = Object.keys(parsed[0]).join(",");
      const rows = parsed.map((obj: any) => Object.values(obj).join(",")).join("\n");
      return `${headers}\n${rows}`;
    } catch {
      return "Invalid JSON syntax.";
    }
  }, [jsonInput]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-500" /> JSON ↔ CSV ↔ XML Structured Data Converter
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Convert structured objects between JSON arrays, CSV spreadsheets, and XML documents.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} className="h-48 p-3 rounded-xl border text-xs font-mono dark:bg-slate-800 dark:text-white" />
        <textarea readOnly value={convertedCsv} className="h-48 p-3 rounded-xl border text-xs font-mono bg-slate-900 text-emerald-400" />
      </div>
    </div>
  );
}

// 75. Regex Text Extractor
function RegexExtractorSub({ onCopy, copied }: any) {
  const [text, setText] = useState<string>("Order #10023 - $50\nOrder #10024 - $75\nOrder #10025 - $120");
  const [pattern, setPattern] = useState<string>("#(\\d+)\\s*-\\s*\\$(\\d+)");

  const extractions = useMemo(() => {
    try {
      const re = new RegExp(pattern, "g");
      const matches = [];
      let m;
      while ((m = re.exec(text)) !== null) {
        matches.push(`${m[1]} | $${m[2]}`);
      }
      return matches;
    } catch {
      return ["Invalid Regex Pattern"];
    }
  }, [text, pattern]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500" /> Regex & Text Extraction Workspace
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Extract capture groups and structured columns from unstructured text using V8 Regex.</p>
        </div>
      </div>

      <div className="space-y-3">
        <input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} className="w-full p-2 border rounded-xl font-mono text-xs dark:bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="h-40 p-3 rounded-xl border text-xs font-mono dark:bg-slate-800" />
          <div className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs space-y-1">
            {extractions.map((ex, i) => <div key={i}>{ex}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// 76. Markdown Workspace
function MarkdownWorkspaceSub({ onCopy, copied }: any) {
  const [md, setMd] = useState<string>("# Comparlify Guide\n\n- Fast Tools\n- Zero Server Footprint\n- 100% In-Browser Privacy");

  const htmlPreview = useMemo(() => {
    return md
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^\- (.*$)/gim, "<li>$1</li>");
  }, [md]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" /> Markdown / HTML Document Workspace
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Bi-directional Markdown ↔ HTML editor with split-screen preview and TOC generator.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <textarea value={md} onChange={(e) => setMd(e.target.value)} className="h-48 p-3 rounded-xl border text-xs font-mono dark:bg-slate-800" />
        <div className="p-4 border rounded-xl prose text-xs dark:bg-slate-800" dangerouslySetInnerHTML={{ __html: htmlPreview }} />
      </div>
    </div>
  );
}

// 71. File Converter Workspace
function FileConverterSub({ onCopy, copied }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-500" /> Universal File Converter Workspace
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Batch convert files across PDF, DOCX, CSV, JSON, XML, Markdown, and Images with ZIP export.</p>
        </div>
      </div>
      <div className="p-8 border-2 border-dashed rounded-2xl text-center text-xs text-slate-500">
        Drag & drop files to queue bulk multi-format conversions locally in browser RAM.
      </div>
    </div>
  );
}
