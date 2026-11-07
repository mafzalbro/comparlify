"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Percent,
  Calendar,
  Clock,
  Globe,
  Scale,
  Tag,
  Receipt,
  Landmark,
  DollarSign,
  TrendingUp,
  Copy,
  Check,
  Share2,
  History,
  Command as CommandIcon,
  Search,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTS (Exact parity with original)
// ─────────────────────────────────────────────────────────────────────────────

type IconType = React.ComponentType<{ className?: string }>;

const CALCULATOR_TOOLS: {
  id: string;
  name: string;
  icon: IconType;
  group: string;
  slug: string;
}[] = [
  {
    id: "percentage-calculator",
    name: "Percentage",
    icon: Percent,
    group: "Math",
    slug: "percentage",
  },
  {
    id: "discount-calculator",
    name: "Discount",
    icon: Tag,
    group: "Finance",
    slug: "discount",
  },
  {
    id: "gst-tax-calculator",
    name: "GST / Tax",
    icon: Receipt,
    group: "Finance",
    slug: "gst-tax",
  },
  {
    id: "emi-loan-calculator",
    name: "EMI / Loan",
    icon: Landmark,
    group: "Finance",
    slug: "emi-loan",
  },
  {
    id: "compound-interest-calculator",
    name: "Compound Interest",
    icon: TrendingUp,
    group: "Finance",
    slug: "compound-interest",
  },
  {
    id: "salary-calculator",
    name: "Salary",
    icon: DollarSign,
    group: "Finance",
    slug: "salary",
  },
  {
    id: "age-calculator",
    name: "Age Calculator",
    icon: Calendar,
    group: "Date & Time",
    slug: "age",
  },
  {
    id: "date-difference-calculator",
    name: "Date Difference",
    icon: Clock,
    group: "Date & Time",
    slug: "date-difference",
  },
  {
    id: "time-zone-converter",
    name: "Time Zone",
    icon: Globe,
    group: "Date & Time",
    slug: "time-zone",
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    icon: Scale,
    group: "Converters",
    slug: "unit-converter",
  },
];

const GROUPS = ["Math", "Finance", "Date & Time", "Converters"];
const CURRENCIES = ["$", "€", "£", "₹", "¥", "A$", "C$"];

interface CalculationHistoryItem {
  id: string;
  toolName: string;
  timestamp: string;
  summary: string;
  details: string;
}

interface PaletteAction {
  id: string;
  label: string;
  group: string;
  hint?: string;
  run: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL UI PIECES (Matches Studio UI)
// ─────────────────────────────────────────────────────────────────────────────

const iconBtn =
  "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40";
const inputCls =
  "h-7 w-full px-2 bg-background border border-border/40 rounded-md text-[11px] font-mono text-foreground focus:outline-none focus:border-primary";
const labelCls =
  "text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-1";

function Tip({
  content,
  children,
}: {
  content: React.ReactNode;
  children: React.ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent sideOffset={6} className="max-w-xs text-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

function Seg({
  value,
  options,
  onChange,
  cols,
}: {
  value: string;
  options: [string, string][];
  onChange: (v: string) => void;
  cols?: number;
}) {
  return (
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${cols ?? options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map(([v, l]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`py-1 px-1.5 rounded-md border text-[10px] font-bold transition-all truncate ${value === v ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function CalculatorWorkspace({
  activeToolId = "percentage-calculator",
}: {
  activeToolId?: string;
}) {
  const router = useRouter();

  const [tool, setTool] = useState<string>(activeToolId);
  const [mode, setMode] = useState<
    "standard" | "reverse" | "compare" | "sensitivity"
  >("standard");
  const [currency, setCurrency] = useState<string>("$");
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [copied, setCopied] = useState(false);

  const [palette, setPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [paletteIdx, setPaletteIdx] = useState(0);
  const paletteListRef = useRef<HTMLUListElement>(null);

  // Handle incoming URL params
  useEffect(() => {
    if (activeToolId) setTool(activeToolId);
    if (typeof window !== "undefined" && window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const hashTool = params.get("tool");
      const hashMode = params.get("mode");
      if (hashTool && CALCULATOR_TOOLS.some((t) => t.id === hashTool))
        setTool(hashTool);
      if (
        hashMode &&
        ["standard", "reverse", "compare", "sensitivity"].includes(hashMode)
      )
        setMode(hashMode as any);
    }
  }, [activeToolId]);

  // Keyboard Shortcuts
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

  const copyText = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);

  // Using useCallback to prevent infinite re-renders in child useEffect dependencies
  const logHistory = useCallback(
    (toolName: string, summary: string, details: string) => {
      setHistory((prev) => {
        if (prev[0]?.summary === summary && prev[0]?.details === details)
          return prev;
        return [
          {
            id: Math.random().toString(36).substring(2, 9),
            toolName,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            summary,
            details,
          },
          ...prev.slice(0, 19),
        ];
      });
    },
    [],
  );

  const share = () => {
    const url = new URL(window.location.href);
    url.hash = `tool=${tool}&mode=${mode}`;
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const activeToolObj =
    CALCULATOR_TOOLS.find((t) => t.id === tool) || CALCULATOR_TOOLS[0];
  const ToolIcon = activeToolObj.icon;

  const actions: PaletteAction[] = [
    ...CALCULATOR_TOOLS.map((t) => ({
      id: `tool-${t.id}`,
      label: `Open ${t.name}`,
      group: "Tools",
      run: () => setTool(t.id),
    })),
    ...["standard", "reverse", "compare", "sensitivity"].map((m) => ({
      id: `mode-${m}`,
      label: `Switch to ${m} Mode`,
      group: "Mode",
      run: () => setMode(m as any),
    })),
    { id: "share", label: "Copy Share URL", group: "Actions", run: share },
  ];

  const filteredActions = useMemo(() => {
    const words = paletteQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return actions.filter((a) =>
      words.every((w) => `${a.label} ${a.group}`.toLowerCase().includes(w)),
    );
  }, [paletteQuery, tool, mode]);

  useEffect(() => {
    if (palette)
      paletteListRef.current
        ?.querySelector<HTMLElement>(`[data-idx="${paletteIdx}"]`)
        ?.scrollIntoView({ block: "nearest" });
  }, [palette, paletteIdx]);

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
            onClick={share}
            className="px-2 py-1 rounded-md border border-border/40 bg-background hover:bg-secondary text-[11px] font-bold text-foreground inline-flex items-center gap-1 transition-colors"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <Share2 className="h-3 w-3" />
            )}{" "}
            {copied ? "Copied" : "Share"}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
        {/* LEFT RAIL */}
        <nav className="shrink-0 gap-0.5 p-1.5 border-b md:border-b-0 md:border-r border-border/40 bg-card/30 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto w-full md:w-48">
          {GROUPS.map((g) => (
            <div
              key={g}
              className="flex flex-row md:flex-col gap-0.5 shrink-0 md:mb-2"
            >
              <span className="hidden md:block px-2 pt-1 pb-0.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                {g}
              </span>
              {CALCULATOR_TOOLS.filter((t) => t.group === g).map((t) => {
                const TIcon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTool(t.id);
                      router.push(`/tools/calculators/${t.slug}`);
                    }}
                    className={`shrink-0 flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-bold transition-all whitespace-nowrap ${tool === t.id ? "bg-primary/10 text-primary ring-1 ring-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}
                  >
                    <TIcon className="h-3.5 w-3.5 shrink-0" /> {t.name}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* CENTER CANVAS */}
        <main className="flex-1 min-w-0 min-h-0 bg-background overflow-y-auto p-3 sm:p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {tool === "percentage-calculator" && (
              <PercentageEngine
                mode={mode}
                currency={currency}
                onCopy={copyText}
                copied={copied}
                onLog={logHistory}
              />
            )}
            {tool === "discount-calculator" && (
              <DiscountEngine
                mode={mode}
                currency={currency}
                onCopy={copyText}
                copied={copied}
                onLog={logHistory}
              />
            )}
            {tool === "gst-tax-calculator" && (
              <GstTaxEngine
                mode={mode}
                currency={currency}
                onCopy={copyText}
                copied={copied}
                onLog={logHistory}
              />
            )}
            {tool === "emi-loan-calculator" && (
              <EmiLoanEngine
                mode={mode}
                currency={currency}
                onCopy={copyText}
                copied={copied}
                onLog={logHistory}
              />
            )}
            {tool === "compound-interest-calculator" && (
              <CompoundInterestEngine
                mode={mode}
                currency={currency}
                onCopy={copyText}
                copied={copied}
                onLog={logHistory}
              />
            )}
            {tool === "salary-calculator" && (
              <SalaryEngine
                mode={mode}
                currency={currency}
                onCopy={copyText}
                copied={copied}
                onLog={logHistory}
              />
            )}
            {tool === "age-calculator" && (
              <AgeEngine
                mode={mode}
                onCopy={copyText}
                copied={copied}
                onLog={logHistory}
              />
            )}
            {tool === "date-difference-calculator" && (
              <DateDifferenceEngine
                mode={mode}
                onCopy={copyText}
                copied={copied}
                onLog={logHistory}
              />
            )}
            {tool === "time-zone-converter" && (
              <TimeZoneEngine
                mode={mode}
                onCopy={copyText}
                copied={copied}
                onLog={logHistory}
              />
            )}
            {tool === "unit-converter" && (
              <UnitEngine
                mode={mode}
                onCopy={copyText}
                copied={copied}
                onLog={logHistory}
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
              <span className={labelCls}>Perspective / Mode</span>
              <Seg
                cols={2}
                value={mode}
                onChange={(v) => setMode(v as any)}
                options={[
                  ["standard", "Standard"],
                  ["reverse", "Reverse"],
                  ["compare", "Compare"],
                  ["sensitivity", "Sensitivity"],
                ]}
              />
            </div>
            <div>
              <span className={labelCls}>Currency</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={inputCls}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-2 border-t border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  History
                </span>
                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    className="text-[9px] text-rose-500 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic">
                  No recent calculations.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {history.map((h) => (
                    <div
                      key={h.id}
                      className="bg-background border border-border/40 rounded-md p-2 space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="font-bold text-primary">
                          {h.toolName}
                        </span>
                        <span className="text-muted-foreground font-mono">
                          {h.timestamp}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-foreground font-mono truncate">
                        {h.summary}
                      </div>
                      <div className="text-[9px] text-muted-foreground truncate font-mono">
                        {h.details}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* BOTTOM STATUS BAR */}
      <footer className="h-6 shrink-0 flex items-center gap-3 px-3 border-t border-border/40 bg-card/50 text-[10px] font-mono text-muted-foreground overflow-x-auto whitespace-nowrap">
        <span className="flex items-center gap-1 text-emerald-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Engine Active
        </span>
        <span>Tool: {activeToolObj.name}</span>
        <span className="hidden sm:inline">Mode: {mode}</span>
        <span className="flex-1" />
        <span>{history.length} logs</span>
        <span>Client-side precision</span>
      </footer>

      {/* COMMAND PALETTE */}
      {palette && (
        <div
          className="fixed inset-0 z-[100000] flex items-start justify-center pt-[12vh] pb-4 px-2 bg-black/40 backdrop-blur-sm"
          onMouseDown={() => setPalette(false)}
        >
          <div
            className="w-[min(92vw,540px)] max-h-[calc(100dvh-12vh-2rem)] flex flex-col rounded-xl border border-border/50 bg-card shadow-2xl overflow-hidden"
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
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setPaletteIdx((i) => Math.max(0, i - 1));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  setPalette(false);
                  setTimeout(() => filteredActions[paletteIdx]?.run(), 0);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setPalette(false);
                }
              }}
              placeholder="Type a calculator or action…"
              className="w-full h-11 px-4 bg-transparent border-b border-border/40 text-sm text-foreground outline-none"
            />
            <ul
              ref={paletteListRef}
              className="flex-1 min-h-0 overflow-y-auto p-1 overscroll-contain"
            >
              {filteredActions.map((a, i) => (
                <li
                  key={a.id}
                  data-idx={i}
                  onMouseEnter={() => setPaletteIdx(i)}
                  onClick={() => {
                    setPalette(false);
                    setTimeout(a.run, 0);
                  }}
                  className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md cursor-pointer text-xs ${i === paletteIdx ? "bg-primary/10 text-foreground" : "text-muted-foreground"}`}
                >
                  <span className="font-bold truncate">{a.label}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                    {a.group}
                  </span>
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
// STANDARDIZED UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function ResultCard({
  label,
  value,
  formula,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  formula: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col justify-between min-h-[120px]">
      <div>
        <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1">
          {label}
        </span>
        <div className="text-3xl font-black text-foreground font-mono">
          {value}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <p
          className="text-[10px] text-muted-foreground font-mono truncate mr-2"
          title={formula}
        >
          {formula}
        </p>
        <button
          onClick={onCopy}
          className="px-2 py-1 rounded-md border border-border/40 bg-background hover:bg-secondary text-[10px] font-bold text-foreground inline-flex items-center gap-1 transition-colors shrink-0"
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}{" "}
          Copy
        </button>
      </div>
    </div>
  );
}

function InputGroup({
  label,
  value,
  onChange,
  type = "number",
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <span className={labelCls}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}

function SliderGroup({
  label,
  value,
  onChange,
  min,
  max,
  step,
  display,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  display: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground font-bold">{label}</span>
        <span className="font-mono font-bold text-foreground">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINES (100% Math & Logic Preserved)
// ─────────────────────────────────────────────────────────────────────────────

function PercentageEngine({ mode, currency, onCopy, copied, onLog }: any) {
  const [p1, setP1] = useState(15);
  const [v1, setV1] = useState(250);
  const [targetResult, setTargetResult] = useState(550);
  const [targetPercent, setTargetPercent] = useState(10);
  const [opts, setOpts] = useState([
    { pct: 10, amount: 200 },
    { pct: 15, amount: 200 },
    { pct: 20, amount: 200 },
  ]);

  const res = (p1 / 100) * v1;
  const reqBase = targetResult / (1 + targetPercent / 100);

  useEffect(() => {
    if (mode === "standard")
      onLog(
        "Percentage",
        `${p1}% of ${currency}${v1} = ${currency}${res.toFixed(2)}`,
        `Formula: (${p1}/100) * ${v1}`,
      );
  }, [p1, v1, mode, res, currency, onLog]);

  if (mode === "standard")
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <InputGroup
            label="Percentage (%)"
            value={p1}
            onChange={(v) => setP1(Number(v))}
          />
          <InputGroup
            label={`Total Base Amount (${currency})`}
            value={v1}
            onChange={(v) => setV1(Number(v))}
          />
        </div>
        <ResultCard
          label="Result Output"
          value={`${currency}${res.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          formula={`(${p1} / 100) × ${v1} = ${res.toFixed(2)}`}
          onCopy={() =>
            onCopy(`${p1}% of ${currency}${v1} = ${currency}${res.toFixed(2)}`)
          }
          copied={copied}
        />
      </div>
    );

  if (mode === "reverse")
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <InputGroup
            label={`Target Final Value (${currency})`}
            value={targetResult}
            onChange={(v) => setTargetResult(Number(v))}
          />
          <InputGroup
            label="Applied Growth (%)"
            value={targetPercent}
            onChange={(v) => setTargetPercent(Number(v))}
          />
        </div>
        <ResultCard
          label="Required Starting Base"
          value={`${currency}${reqBase.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          formula={`To reach ${currency}${targetResult} with ${targetPercent}% growth`}
          onCopy={() => onCopy(`${currency}${reqBase.toFixed(2)}`)}
          copied={copied}
        />
      </div>
    );

  if (mode === "compare")
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {opts.map((opt, i) => (
          <div
            key={i}
            className="bg-card/60 border border-border/30 rounded-lg p-3 space-y-3"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
              Option {i + 1}
            </span>
            <InputGroup
              label="Percentage (%)"
              value={opt.pct}
              onChange={(v) =>
                setOpts(
                  opts.map((o, idx) =>
                    idx === i ? { ...o, pct: Number(v) } : o,
                  ),
                )
              }
            />
            <InputGroup
              label={`Base Amount (${currency})`}
              value={opt.amount}
              onChange={(v) =>
                setOpts(
                  opts.map((o, idx) =>
                    idx === i ? { ...o, amount: Number(v) } : o,
                  ),
                )
              }
            />
            <div className="pt-2 border-t border-border/30">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-1">
                Calculated Result
              </span>
              <span className="text-xl font-black text-foreground font-mono">
                {currency}
                {((opt.pct / 100) * opt.amount).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="bg-card/60 border border-border/30 rounded-lg p-3 space-y-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
        Sensitivity Matrix (Base: {currency}
        {v1})
      </span>
      <table className="w-full text-[11px] text-left font-mono">
        <thead>
          <tr className="border-b border-border/30 text-muted-foreground">
            <th className="pb-1">Rate</th>
            <th className="pb-1">Value</th>
            <th className="pb-1">Variance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
          {[-5, -2, 0, 2, 5, 10].map((step) => {
            const rate = Math.max(0, p1 + step);
            const val = (rate / 100) * v1;
            const diff = val - res;
            return (
              <tr
                key={step}
                className={step === 0 ? "bg-primary/10 font-bold" : ""}
              >
                <td className="py-1.5">
                  {rate}% {step === 0 && "(Cur)"}
                </td>
                <td className="py-1.5">
                  {currency}
                  {val.toFixed(2)}
                </td>
                <td
                  className={`py-1.5 ${diff >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {diff >= 0
                    ? `+${currency}${diff.toFixed(2)}`
                    : `-${currency}${Math.abs(diff).toFixed(2)}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DiscountEngine({ mode, currency, onCopy, copied, onLog }: any) {
  const [price, setPrice] = useState(150);
  const [disc, setDisc] = useState(20);
  const [targetBudget, setTargetBudget] = useState(100);
  const [opts, setOpts] = useState([
    { price: 200, disc: 20 },
    { price: 180, disc: 15 },
    { price: 150, disc: 10 },
  ]);

  const finalPrice = price * (1 - disc / 100);
  const reqDiscount =
    price > 0 ? Math.max(0, ((price - targetBudget) / price) * 100) : 0;

  if (mode === "standard")
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <InputGroup
            label={`Original Price (${currency})`}
            value={price}
            onChange={(v) => setPrice(Number(v))}
          />
          <InputGroup
            label="Discount (%)"
            value={disc}
            onChange={(v) => setDisc(Number(v))}
          />
        </div>
        <ResultCard
          label="Final Checkout Price"
          value={`${currency}${finalPrice.toFixed(2)}`}
          formula={`You save ${currency}${(price - finalPrice).toFixed(2)}`}
          onCopy={() => onCopy(`${currency}${finalPrice.toFixed(2)}`)}
          copied={copied}
        />
      </div>
    );

  if (mode === "reverse")
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <InputGroup
            label={`Original Price (${currency})`}
            value={price}
            onChange={(v) => setPrice(Number(v))}
          />
          <InputGroup
            label={`Target Budget (${currency})`}
            value={targetBudget}
            onChange={(v) => setTargetBudget(Number(v))}
          />
        </div>
        <ResultCard
          label="Required Discount"
          value={`${reqDiscount.toFixed(1)}% OFF`}
          formula={`To buy ${currency}${price} item for ${currency}${targetBudget}`}
          onCopy={() => onCopy(`${reqDiscount.toFixed(1)}%`)}
          copied={copied}
        />
      </div>
    );

  if (mode === "compare")
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {opts.map((opt, i) => (
          <div
            key={i}
            className="bg-card/60 border border-border/30 rounded-lg p-3 space-y-3"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
              Deal {i + 1}
            </span>
            <InputGroup
              label={`Price (${currency})`}
              value={opt.price}
              onChange={(v) =>
                setOpts(
                  opts.map((o, idx) =>
                    idx === i ? { ...o, price: Number(v) } : o,
                  ),
                )
              }
            />
            <InputGroup
              label="Discount (%)"
              value={opt.disc}
              onChange={(v) =>
                setOpts(
                  opts.map((o, idx) =>
                    idx === i ? { ...o, disc: Number(v) } : o,
                  ),
                )
              }
            />
            <div className="pt-2 border-t border-border/30">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-1">
                Final Price
              </span>
              <span className="text-xl font-black text-emerald-500 font-mono">
                {currency}
                {(opt.price * (1 - opt.disc / 100)).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="bg-card/60 border border-border/30 rounded-lg p-3 space-y-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
        Discount Sensitivity (Sticker: {currency}
        {price})
      </span>
      <table className="w-full text-[11px] text-left font-mono">
        <thead>
          <tr className="border-b border-border/30 text-muted-foreground">
            <th className="pb-1">Discount %</th>
            <th className="pb-1">Final Price</th>
            <th className="pb-1">Total Savings</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
          {[5, 10, 15, 20, 25, 30, 40, 50].map((dRate) => {
            const fp = price * (1 - dRate / 100);
            return (
              <tr
                key={dRate}
                className={dRate === disc ? "bg-primary/10 font-bold" : ""}
              >
                <td className="py-1.5">
                  {dRate}% {dRate === disc && "(Cur)"}
                </td>
                <td className="py-1.5">
                  {currency}
                  {fp.toFixed(2)}
                </td>
                <td className="py-1.5 text-emerald-500">
                  +{currency}
                  {(price - fp).toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GstTaxEngine({ mode, currency, onCopy, copied, onLog }: any) {
  const [base, setBase] = useState(1000);
  const [taxRate, setTaxRate] = useState(18);
  const [targetGross, setTargetGross] = useState(1180);

  const taxAmount = (taxRate / 100) * base;
  const gross = base + taxAmount;
  const reqBase = targetGross / (1 + taxRate / 100);

  if (mode === "standard" || mode === "compare" || mode === "sensitivity")
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <InputGroup
            label={`Net Base Amount (${currency})`}
            value={base}
            onChange={(v) => setBase(Number(v))}
          />
          <InputGroup
            label="Tax Rate (%)"
            value={taxRate}
            onChange={(v) => setTaxRate(Number(v))}
          />
        </div>
        <ResultCard
          label="Gross Total Amount"
          value={`${currency}${gross.toFixed(2)}`}
          formula={`Tax (${taxRate}%): +${currency}${taxAmount.toFixed(2)}`}
          onCopy={() => onCopy(`${currency}${gross.toFixed(2)}`)}
          copied={copied}
        />
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <InputGroup
          label={`Target Gross Price (${currency})`}
          value={targetGross}
          onChange={(v) => setTargetGross(Number(v))}
        />
        <InputGroup
          label="Tax Rate (%)"
          value={taxRate}
          onChange={(v) => setTaxRate(Number(v))}
        />
      </div>
      <ResultCard
        label="Extracted Base Amount"
        value={`${currency}${reqBase.toFixed(2)}`}
        formula={`Embedded Tax: ${currency}${(targetGross - reqBase).toFixed(2)}`}
        onCopy={() => onCopy(`${currency}${reqBase.toFixed(2)}`)}
        copied={copied}
      />
    </div>
  );
}

function EmiLoanEngine({ mode, currency, onCopy, copied, onLog }: any) {
  const [p, setP] = useState(250000);
  const [r, setR] = useState(7.5);
  const [y, setY] = useState(15);
  const [targetEmi, setTargetEmi] = useState(2000);
  const [banks, setBanks] = useState([
    { p: 250000, r: 7.5, y: 15 },
    { p: 250000, r: 6.8, y: 15 },
    { p: 250000, r: 8.2, y: 15 },
  ]);

  const calcEmi = (loan: number, rate: number, years: number) => {
    const mRate = rate / 12 / 100,
      months = years * 12;
    if (mRate === 0) return loan / months;
    return (
      (loan * mRate * Math.pow(1 + mRate, months)) /
      (Math.pow(1 + mRate, months) - 1)
    );
  };

  const currentEmi = calcEmi(p, r, y);
  const totalInterest = currentEmi * y * 12 - p;
  const maxLoan = useMemo(() => {
    const mRate = r / 12 / 100,
      months = y * 12;
    if (mRate === 0) return targetEmi * months;
    return (
      (targetEmi * (Math.pow(1 + mRate, months) - 1)) /
      (mRate * Math.pow(1 + mRate, months))
    );
  }, [targetEmi, r, y]);

  if (mode === "standard")
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <SliderGroup
            label="Loan Principal"
            value={p}
            onChange={setP}
            min={10000}
            max={1000000}
            step={5000}
            display={`${currency}${p.toLocaleString()}`}
          />
          <SliderGroup
            label="Interest Rate"
            value={r}
            onChange={setR}
            min={1}
            max={25}
            step={0.1}
            display={`${r}%`}
          />
          <SliderGroup
            label="Tenure"
            value={y}
            onChange={setY}
            min={1}
            max={30}
            step={1}
            display={`${y} Years`}
          />
        </div>
        <ResultCard
          label="Monthly EMI Payment"
          value={`${currency}${currentEmi.toFixed(2)}`}
          formula={`Total Interest: ${currency}${totalInterest.toFixed(2)}`}
          onCopy={() => onCopy(`${currency}${currentEmi.toFixed(2)}`)}
          copied={copied}
        />
      </div>
    );

  if (mode === "reverse")
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <InputGroup
            label={`Target Monthly Budget (${currency})`}
            value={targetEmi}
            onChange={(v) => setTargetEmi(Number(v))}
          />
          <InputGroup
            label="Interest Rate (%)"
            value={r}
            onChange={(v) => setR(Number(v))}
          />
          <InputGroup
            label="Tenure (Years)"
            value={y}
            onChange={(v) => setY(Number(v))}
          />
        </div>
        <ResultCard
          label="Max Affordable Loan"
          value={`${currency}${maxLoan.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          formula={`With ${currency}${targetEmi}/mo at ${r}%`}
          onCopy={() => onCopy(`${currency}${maxLoan.toFixed(0)}`)}
          copied={copied}
        />
      </div>
    );

  if (mode === "compare")
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {banks.map((b, i) => (
          <div
            key={i}
            className="bg-card/60 border border-border/30 rounded-lg p-3 space-y-3"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
              Bank {String.fromCharCode(65 + i)}
            </span>
            <InputGroup
              label="Rate (%)"
              value={b.r}
              onChange={(v) =>
                setBanks(
                  banks.map((bk, idx) =>
                    idx === i ? { ...bk, r: Number(v) } : bk,
                  ),
                )
              }
            />
            <div className="pt-2 border-t border-border/30">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-1">
                Monthly EMI
              </span>
              <span className="text-xl font-black text-emerald-500 font-mono">
                {currency}
                {calcEmi(b.p, b.r, b.y).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="bg-card/60 border border-border/30 rounded-lg p-3 space-y-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
        Interest Rate Sensitivity
      </span>
      <table className="w-full text-[11px] text-left font-mono">
        <thead>
          <tr className="border-b border-border/30 text-muted-foreground">
            <th className="pb-1">Rate</th>
            <th className="pb-1">EMI</th>
            <th className="pb-1">Total Interest</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
          {[5.0, 6.0, 7.0, 7.5, 8.0, 9.0, 10.0].map((rate) => {
            const emi = calcEmi(p, rate, y);
            const totInt = emi * y * 12 - p;
            return (
              <tr
                key={rate}
                className={rate === r ? "bg-primary/10 font-bold" : ""}
              >
                <td className="py-1.5">
                  {rate}% {rate === r && "(Cur)"}
                </td>
                <td className="py-1.5">
                  {currency}
                  {emi.toFixed(2)}
                </td>
                <td className="py-1.5 text-amber-500">
                  {currency}
                  {totInt.toFixed(0)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SalaryEngine({ mode, currency, onCopy, copied, onLog }: any) {
  const [wage, setWage] = useState(45);
  const [hrs, setHrs] = useState(40);
  const [tax, setTax] = useState(20);
  const [targetNet, setTargetNet] = useState(5000);

  const annualGross = wage * hrs * 52;
  const monthlyNet = (annualGross * (1 - tax / 100)) / 12;
  const reqWage = (targetNet * 12) / (1 - tax / 100) / (hrs * 52);

  if (mode === "standard")
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <InputGroup
            label={`Hourly Wage (${currency})`}
            value={wage}
            onChange={(v) => setWage(Number(v))}
          />
          <InputGroup
            label="Hours Per Week"
            value={hrs}
            onChange={(v) => setHrs(Number(v))}
          />
          <InputGroup
            label="Tax (%)"
            value={tax}
            onChange={(v) => setTax(Number(v))}
          />
        </div>
        <ResultCard
          label="Net Take-Home Pay"
          value={`${currency}${monthlyNet.toFixed(2)}/mo`}
          formula={`Annual Gross: ${currency}${annualGross.toLocaleString()}`}
          onCopy={() => onCopy(`${currency}${monthlyNet.toFixed(2)}`)}
          copied={copied}
        />
      </div>
    );

  if (mode === "reverse")
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <InputGroup
            label={`Target Net Monthly (${currency})`}
            value={targetNet}
            onChange={(v) => setTargetNet(Number(v))}
          />
          <InputGroup
            label="Tax Bracket (%)"
            value={tax}
            onChange={(v) => setTax(Number(v))}
          />
        </div>
        <ResultCard
          label="Required Hourly Wage"
          value={`${currency}${reqWage.toFixed(2)}/hr`}
          formula={`Equivalent Gross: ${currency}${(reqWage * hrs * 52).toFixed(0)}/yr`}
          onCopy={() => onCopy(`${currency}${reqWage.toFixed(2)}`)}
          copied={copied}
        />
      </div>
    );

  return (
    <div className="bg-card/60 border border-border/30 rounded-lg p-3 space-y-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
        Salary Scale Matrix ({hrs} hrs/wk)
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[25, 35, 45, 55, 65, 75, 85, 100].map((w) => (
          <div
            key={w}
            className="bg-background border border-border/40 rounded-md p-2"
          >
            <span className="text-[9px] text-muted-foreground block">
              {currency}
              {w}/hr
            </span>
            <span className="text-[11px] font-bold text-emerald-500 font-mono">
              ${((w * hrs * 52 * (1 - tax / 100)) / 12).toFixed(0)}/mo
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompoundInterestEngine({
  mode,
  currency,
  onCopy,
  copied,
  onLog,
}: any) {
  const [init, setInit] = useState(5000);
  const [monthly, setMonthly] = useState(300);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(10);
  const [targetGoal, setTargetGoal] = useState(250000);

  const calc = (i: number, m: number, r: number, y: number) => {
    let total = i,
      dep = i;
    for (let step = 1; step <= y * 12; step++) {
      total += m;
      dep += m;
      total += total * (r / 100 / 12);
    }
    return { total, dep, interest: total - dep };
  };
  const data = calc(init, monthly, rate, years);

  const reqMonthly = useMemo(() => {
    const months = years * 12,
      rM = rate / 100 / 12;
    if (rM === 0) return Math.max(0, (targetGoal - init) / months);
    const initFV = init * Math.pow(1 + rM, months);
    const rem = targetGoal - initFV;
    if (rem <= 0) return 0;
    return rem / ((Math.pow(1 + rM, months) - 1) / rM);
  }, [targetGoal, init, rate, years]);

  if (mode === "standard")
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <InputGroup
            label={`Initial Principal (${currency})`}
            value={init}
            onChange={(v) => setInit(Number(v))}
          />
          <InputGroup
            label={`Monthly Contribution (${currency})`}
            value={monthly}
            onChange={(v) => setMonthly(Number(v))}
          />
          <InputGroup
            label="Return Rate (%)"
            value={rate}
            onChange={(v) => setRate(Number(v))}
          />
          <InputGroup
            label="Horizon (Years)"
            value={years}
            onChange={(v) => setYears(Number(v))}
          />
        </div>
        <ResultCard
          label="Future Portfolio Value"
          value={`${currency}${data.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          formula={`Interest Earned: +${currency}${data.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          onCopy={() => onCopy(`${currency}${data.total.toFixed(0)}`)}
          copied={copied}
        />
      </div>
    );

  if (mode === "reverse")
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <InputGroup
            label={`Target Wealth Goal (${currency})`}
            value={targetGoal}
            onChange={(v) => setTargetGoal(Number(v))}
          />
          <InputGroup
            label="Expected Return (%)"
            value={rate}
            onChange={(v) => setRate(Number(v))}
          />
          <InputGroup
            label="Horizon (Years)"
            value={years}
            onChange={(v) => setYears(Number(v))}
          />
        </div>
        <ResultCard
          label="Required Monthly Contribution"
          value={`${currency}${reqMonthly.toFixed(2)}/mo`}
          formula={`To reach ${currency}${targetGoal.toLocaleString()} in ${years} yrs`}
          onCopy={() => onCopy(`${currency}${reqMonthly.toFixed(2)}`)}
          copied={copied}
        />
      </div>
    );

  return (
    <div className="bg-card/60 border border-border/30 rounded-lg p-3 space-y-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
        Return Rate Sensitivity ({years} Yrs)
      </span>
      <table className="w-full text-[11px] text-left font-mono">
        <thead>
          <tr className="border-b border-border/30 text-muted-foreground">
            <th className="pb-1">Rate</th>
            <th className="pb-1">Final Value</th>
            <th className="pb-1">Interest</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
          {[5, 6, 7, 8, 9, 10, 12, 15].map((rStep) => {
            const d = calc(init, monthly, rStep, years);
            return (
              <tr
                key={rStep}
                className={rStep === rate ? "bg-primary/10 font-bold" : ""}
              >
                <td className="py-1.5">
                  {rStep}% {rStep === rate && "(Cur)"}
                </td>
                <td className="py-1.5">
                  {currency}
                  {d.total.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td className="py-1.5 text-emerald-500">
                  +{currency}
                  {d.interest.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AgeEngine({ mode, onCopy, copied, onLog }: any) {
  const [birth, setBirth] = useState("1998-05-15");
  const [targetAge, setTargetAge] = useState(30);

  const ageData = useMemo(() => {
    const start = new Date(birth);
    if (isNaN(start.getTime())) return null;
    const end = new Date();
    let y = end.getFullYear() - start.getFullYear();
    let m = end.getMonth() - start.getMonth();
    let d = end.getDate() - start.getDate();
    if (d < 0) {
      m--;
      d += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    }
    if (m < 0) {
      y--;
      m += 12;
    }
    const totalDays = Math.floor((end.getTime() - start.getTime()) / 86400000);
    return { y, m, d, totalDays };
  }, [birth]);

  const targetDate = useMemo(() => {
    const start = new Date(birth);
    if (isNaN(start.getTime())) return "";
    return new Date(
      start.getFullYear() + targetAge,
      start.getMonth(),
      start.getDate(),
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [birth, targetAge]);

  if (mode === "standard" && ageData)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputGroup
          label="Date of Birth"
          value={birth}
          onChange={setBirth}
          type="date"
        />
        <ResultCard
          label="Exact Age"
          value={`${ageData.y} Yrs, ${ageData.m} Mos, ${ageData.d} Days`}
          formula={`Total Days Lived: ${ageData.totalDays.toLocaleString()}`}
          onCopy={() =>
            onCopy(`${ageData.y} Yrs, ${ageData.m} Mos, ${ageData.d} Days`)
          }
          copied={copied}
        />
      </div>
    );

  if (mode === "reverse")
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <InputGroup
            label="Date of Birth"
            value={birth}
            onChange={setBirth}
            type="date"
          />
          <InputGroup
            label="Target Age"
            value={targetAge}
            onChange={(v) => setTargetAge(Number(v))}
          />
        </div>
        <ResultCard
          label="Target Milestone Date"
          value={targetDate}
          formula={`You will turn exactly ${targetAge} years old.`}
          onCopy={() => onCopy(targetDate)}
          copied={copied}
        />
      </div>
    );

  return (
    <div className="bg-card/60 border border-border/30 rounded-lg p-3 space-y-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
        Milestone Horizon Timeline
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[30, 40, 50, 60, 65, 70, 80, 100].map((mAge) => {
          const start = new Date(birth);
          const mDate = new Date(
            start.getFullYear() + mAge,
            start.getMonth(),
            start.getDate(),
          );
          return (
            <div
              key={mAge}
              className="bg-background border border-border/40 rounded-md p-2"
            >
              <span className="text-[9px] text-muted-foreground block">
                Age {mAge}
              </span>
              <span className="text-[11px] font-bold text-foreground font-mono">
                {mDate.getFullYear()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DateDifferenceEngine({ mode, onCopy, copied, onLog }: any) {
  const [start, setStart] = useState("2025-01-01");
  const [end, setEnd] = useState("2025-12-31");
  const [offset, setOffset] = useState(90);

  const diff = useMemo(() => {
    const s = new Date(start),
      e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
    const totalDays = Math.abs(
      Math.round((e.getTime() - s.getTime()) / 86400000),
    );
    let biz = 0;
    const cur = new Date(Math.min(s.getTime(), e.getTime())),
      fin = new Date(Math.max(s.getTime(), e.getTime()));
    while (cur <= fin) {
      if (cur.getDay() !== 0 && cur.getDay() !== 6) biz++;
      cur.setDate(cur.getDate() + 1);
    }
    return { totalDays, biz };
  }, [start, end]);

  useEffect(() => {
    if (diff)
      onLog(
        "Date Difference",
        `${diff.totalDays} Total Days (${diff.biz} Working Days)`,
        `From ${start} to ${end}`,
      );
  }, [start, end, diff, onLog]);

  const offsetDate = useMemo(() => {
    const s = new Date(start);
    if (isNaN(s.getTime())) return "";
    s.setDate(s.getDate() + offset);
    return s.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [start, offset]);

  if (mode === "standard" && diff)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <InputGroup
            label="Start Date"
            value={start}
            onChange={setStart}
            type="date"
          />
          <InputGroup
            label="End Date"
            value={end}
            onChange={setEnd}
            type="date"
          />
        </div>
        <ResultCard
          label="Duration Summary"
          value={`${diff.totalDays} Calendar Days`}
          formula={`Business Days: ${diff.biz} Days`}
          onCopy={() => onCopy(`${diff.totalDays} Days`)}
          copied={copied}
        />
      </div>
    );

  if (mode === "reverse")
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <InputGroup
            label="Start Date"
            value={start}
            onChange={setStart}
            type="date"
          />
          <InputGroup
            label="Day Offset (+/-)"
            value={offset}
            onChange={(v) => setOffset(Number(v))}
          />
        </div>
        <ResultCard
          label="Target Offset Date"
          value={offsetDate}
          formula={`Adding ${offset} days to ${start}`}
          onCopy={() => onCopy(offsetDate)}
          copied={copied}
        />
      </div>
    );

  return (
    <div className="bg-card/60 border border-border/30 rounded-lg p-3 space-y-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
        Timeline Offset Scale (Base: {start})
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[30, 60, 90, 180, 365].map((o) => {
          const d = new Date(start);
          d.setDate(d.getDate() + o);
          return (
            <div
              key={o}
              className="bg-background border border-border/40 rounded-md p-2"
            >
              <span className="text-[9px] text-muted-foreground block">
                +{o} Days
              </span>
              <span className="text-[11px] font-bold text-emerald-500 font-mono">
                {d.toISOString().split("T")[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeZoneEngine({ mode, onCopy, copied, onLog }: any) {
  const [baseTime, setBaseTime] = useState("14:00");
  const [baseZone, setBaseZone] = useState("UTC");
  const TIMEZONES = [
    { name: "UTC", zone: "UTC" },
    { name: "New York", zone: "America/New_York" },
    { name: "London", zone: "Europe/London" },
    { name: "Paris", zone: "Europe/Paris" },
    { name: "Tokyo", zone: "Asia/Tokyo" },
    { name: "India", zone: "Asia/Kolkata" },
    { name: "San Francisco", zone: "America/Los_Angeles" },
  ];

  const times = useMemo(() => {
    const now = new Date();
    const [h, m] = baseTime.split(":").map(Number);
    const tempUtc = new Date(
      Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        h || 0,
        m || 0,
      ),
    );
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: baseZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(tempUtc);
    const p = (t: string) => parts.find((x) => x.type === t)?.value || "00";
    const baseStr = `${p("year")}-${p("month")}-${p("day")}T${p("hour")}:${p("minute")}:00`;
    const source = new Date(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${baseTime}:00`,
    ).getTime();
    const offsetMs = new Date(baseStr).getTime() - tempUtc.getTime();
    const target = new Date(source - offsetMs);

    return TIMEZONES.map((tz) => {
      try {
        return {
          ...tz,
          time: target.toLocaleTimeString("en-US", {
            timeZone: tz.zone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        };
      } catch {
        return { ...tz, time: baseTime };
      }
    });
  }, [baseTime, baseZone]);

  useEffect(() => {
    onLog(
      "Time Zone",
      `Source: ${baseTime} (${baseZone})`,
      times.map((t) => `${t.name}: ${t.time}`).join(" | "),
    );
  }, [baseTime, baseZone, times, onLog]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-4">
        <InputGroup
          label="Source Time"
          value={baseTime}
          onChange={setBaseTime}
          type="time"
        />
        <div>
          <span className={labelCls}>Source Time Zone</span>
          <select
            value={baseZone}
            onChange={(e) => setBaseZone(e.target.value)}
            className={inputCls}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.zone} value={tz.zone}>
                {tz.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="md:col-span-2 bg-card/60 border border-border/30 rounded-lg p-3 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-2">
          Global Overlap
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {times.map((t) => (
            <div
              key={t.zone}
              className="bg-background border border-border/40 rounded-md p-2 flex items-center justify-between"
            >
              <span className="text-[11px] font-bold text-muted-foreground">
                {t.name}
              </span>
              <span className="text-[11px] font-bold text-emerald-500 font-mono">
                {t.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UnitEngine({ mode, onCopy, copied, onLog }: any) {
  const TYPES: any = {
    length: {
      label: "Length",
      units: {
        m: { l: "Meters", f: 1 },
        km: { l: "Kilometers", f: 1000 },
        cm: { l: "Centimeters", f: 0.01 },
        mm: { l: "Millimeters", f: 0.001 },
        mi: { l: "Miles", f: 1609.34 },
        ft: { l: "Feet", f: 0.3048 },
        in: { l: "Inches", f: 0.0254 },
      },
    },
    weight: {
      label: "Weight",
      units: {
        kg: { l: "Kilograms", f: 1 },
        g: { l: "Grams", f: 0.001 },
        mg: { l: "Milligrams", f: 0.000001 },
        lb: { l: "Pounds", f: 0.453592 },
        oz: { l: "Ounces", f: 0.0283495 },
      },
    },
    temperature: {
      label: "Temperature",
      units: {
        C: { l: "Celsius", f: 1 },
        F: { l: "Fahrenheit", f: 1 },
        K: { l: "Kelvin", f: 1 },
      },
    },
    area: {
      label: "Area",
      units: {
        sqm: { l: "Square Meters", f: 1 },
        sqkm: { l: "Square Kilometers", f: 1000000 },
        sqft: { l: "Square Feet", f: 0.092903 },
        acre: { l: "Acres", f: 4046.86 },
        hectare: { l: "Hectares", f: 10000 },
      },
    },
    volume: {
      label: "Volume",
      units: {
        L: { l: "Liters", f: 1 },
        mL: { l: "Milliliters", f: 0.001 },
        gal: { l: "Gallons", f: 3.78541 },
        cup: { l: "Cups", f: 0.236588 },
      },
    },
    speed: {
      label: "Speed",
      units: {
        mps: { l: "Meters/sec", f: 1 },
        kph: { l: "Kilometers/hr", f: 0.277778 },
        mph: { l: "Miles/hr", f: 0.44704 },
        knot: { l: "Knots", f: 0.514444 },
      },
    },
    data: {
      label: "Data Storage",
      units: {
        B: { l: "Bytes", f: 1 },
        KB: { l: "Kilobytes", f: 1024 },
        MB: { l: "Megabytes", f: 1048576 },
        GB: { l: "Gigabytes", f: 1073741824 },
        TB: { l: "Terabytes", f: 1099511627776 },
      },
    },
  };
  const [cat, setCat] = useState("length");
  const [val, setVal] = useState(100);
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("ft");

  const res = useMemo(() => {
    if (cat === "temperature") {
      if (from === to) return val;
      if (from === "C" && to === "F") return (val * 9) / 5 + 32;
      if (from === "C" && to === "K") return val + 273.15;
      if (from === "F" && to === "C") return ((val - 32) * 5) / 9;
      if (from === "F" && to === "K") return ((val - 32) * 5) / 9 + 273.15;
      if (from === "K" && to === "C") return val - 273.15;
      if (from === "K" && to === "F") return ((val - 273.15) * 9) / 5 + 32;
      return val;
    }
    const uF = TYPES[cat].units[from],
      uT = TYPES[cat].units[to];
    if (!uF || !uT) return 0;
    return (val * uF.f) / uT.f;
  }, [cat, val, from, to]);

  useEffect(() => {
    onLog(
      "Unit Converter",
      `${val} ${from} = ${res.toFixed(4)} ${to}`,
      `Category: ${TYPES[cat].label}`,
    );
  }, [cat, val, from, to, res, onLog]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {Object.keys(TYPES).map((k) => (
          <button
            key={k}
            onClick={() => {
              setCat(k);
              const first = Object.keys(TYPES[k].units);
              setFrom(first[0]);
              setTo(first[1] || first[0]);
            }}
            className={`px-2 py-1 rounded-md border text-[10px] font-bold transition-all ${cat === k ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"}`}
          >
            {TYPES[k].label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <InputGroup
            label="Value to Convert"
            value={val}
            onChange={(v) => setVal(Number(v))}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className={labelCls}>From</span>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className={inputCls}
              >
                {Object.entries(TYPES[cat].units).map(([k, u]: any) => (
                  <option key={k} value={k}>
                    {u.l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className={labelCls}>To</span>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className={inputCls}
              >
                {Object.entries(TYPES[cat].units).map(([k, u]: any) => (
                  <option key={k} value={k}>
                    {u.l}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <ResultCard
          label="Converted Output"
          value={`${res.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${to}`}
          formula={`${val} ${from} = ${res.toFixed(4)} ${to}`}
          onCopy={() => onCopy(`${res.toFixed(4)} ${to}`)}
          copied={copied}
        />
      </div>
    </div>
  );
}
