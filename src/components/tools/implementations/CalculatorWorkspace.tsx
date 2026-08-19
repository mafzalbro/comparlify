"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Calculator,
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
  GitCompare,
  BarChart3,
  Award,
  Zap,
} from "lucide-react";

interface CalculatorWorkspaceProps {
  activeToolId?: string;
}

const CALCULATOR_TOOLS = [
  { id: "percentage-calculator", name: "Percentage", icon: Percent, slug: "percentage" },
  { id: "age-calculator", name: "Age Calculator", icon: Calendar, slug: "age" },
  { id: "date-difference-calculator", name: "Date Difference", icon: Clock, slug: "date-difference" },
  { id: "time-zone-converter", name: "Time Zone Converter", icon: Globe, slug: "time-zone" },
  { id: "unit-converter", name: "Unit Converter", icon: Scale, slug: "unit-converter" },
  { id: "discount-calculator", name: "Discount Calculator", icon: Tag, slug: "discount" },
  { id: "gst-tax-calculator", name: "GST / Tax Calculator", icon: Receipt, slug: "gst-tax" },
  { id: "emi-loan-calculator", name: "EMI / Loan", icon: Landmark, slug: "emi-loan" },
  { id: "salary-calculator", name: "Salary Converter", icon: DollarSign, slug: "salary" },
  { id: "compound-interest-calculator", name: "Compound Interest", icon: TrendingUp, slug: "compound-interest" },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "INR", symbol: "₹", label: "INR (₹)" },
  { code: "JPY", symbol: "¥", label: "JPY (¥)" },
  { code: "AUD", symbol: "A$", label: "AUD (A$)" },
  { code: "CAD", symbol: "C$", label: "CAD (C$)" },
];

export interface CalculationHistoryItem {
  id: string;
  toolName: string;
  timestamp: string;
  summary: string;
  details: string;
}

export function CalculatorWorkspace({ activeToolId }: CalculatorWorkspaceProps) {
  const [selectedToolId, setSelectedToolId] = useState<string>(
    activeToolId || "percentage-calculator"
  );
  const [activeEngineMode, setActiveEngineMode] = useState<
    "standard" | "reverse" | "compare" | "sensitivity"
  >("standard");
  const [currency, setCurrency] = useState<string>("$");
  const [copied, setCopied] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  useEffect(() => {
    if (activeToolId) {
      setSelectedToolId(activeToolId);
    }
    if (typeof window !== "undefined" && window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const hashTool = params.get("tool");
      const hashMode = params.get("mode");
      if (hashTool && CALCULATOR_TOOLS.some((t) => t.id === hashTool)) {
        setSelectedToolId(hashTool);
      }
      if (hashMode && ["standard", "reverse", "compare", "sensitivity"].includes(hashMode)) {
        setActiveEngineMode(hashMode as any);
      }
    }
  }, [activeToolId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.hash = `tool=${selectedToolId}&mode=${activeEngineMode}`;
    navigator.clipboard.writeText(url.toString());
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const addHistoryItem = (toolName: string, summary: string, details: string) => {
    const newItem: CalculationHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      toolName,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      summary,
      details,
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 19)]);
  };

  return (
    <div className="w-full space-y-6">
      {/* Workspace Header & Toolbar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Comparlify Decision Engine
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Interactive Scenario Planner
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Analyze options side-by-side, solve target scenarios in reverse, and forecast sensitivity matrix outputs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                showHistory
                  ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History ({history.length})</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              {shared ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{shared ? "Link Copied" : "Share"}</span>
            </button>

            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Currency:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.symbol}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sub-tool tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 no-scrollbar">
          {CALCULATOR_TOOLS.map((tool) => {
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

        {/* Shared Perspective Toolbar */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
            Operating Perspective:
          </span>
          {[
            { id: "standard", name: "⚡ Standard Calculator" },
            { id: "reverse", name: "🔄 Reverse Mode Solver" },
            { id: "compare", name: "⚖️ Option Comparison Engine" },
            { id: "sensitivity", name: "📊 Sensitivity Matrix" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveEngineMode(mode.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${
                activeEngineMode === mode.id
                  ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {mode.name}
            </button>
          ))}
        </div>
      </div>

      {/* History Slide-Over Drawer */}
      {showHistory && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
              <History className="w-4 h-4 text-blue-500" /> Recent Session Log ({history.length})
            </h4>
            {history.length > 0 && (
              <button onClick={() => setHistory([])} className="text-[11px] font-semibold text-rose-500 hover:underline">
                Clear History
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">No calculations logged yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {history.map((item) => (
                <div key={item.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{item.toolName}</span>
                    <span className="text-slate-400 font-mono">{item.timestamp}</span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{item.summary}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">{item.details}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Sub-Calculator Scenario Engine View */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        {selectedToolId === "percentage-calculator" && (
          <PercentageDecisionEngine engineMode={activeEngineMode} currency={currency} onCopy={handleCopy} copied={copied} onLogHistory={addHistoryItem} />
        )}
        {selectedToolId === "age-calculator" && (
          <AgeDecisionEngine engineMode={activeEngineMode} onCopy={handleCopy} copied={copied} onLogHistory={addHistoryItem} />
        )}
        {selectedToolId === "discount-calculator" && (
          <DiscountDecisionEngine engineMode={activeEngineMode} currency={currency} onCopy={handleCopy} copied={copied} onLogHistory={addHistoryItem} />
        )}
        {selectedToolId === "gst-tax-calculator" && (
          <GstTaxDecisionEngine engineMode={activeEngineMode} currency={currency} onCopy={handleCopy} copied={copied} onLogHistory={addHistoryItem} />
        )}
        {selectedToolId === "emi-loan-calculator" && (
          <EmiLoanDecisionEngine engineMode={activeEngineMode} currency={currency} onCopy={handleCopy} copied={copied} onLogHistory={addHistoryItem} />
        )}
        {selectedToolId === "salary-calculator" && (
          <SalaryDecisionEngine engineMode={activeEngineMode} currency={currency} onCopy={handleCopy} copied={copied} onLogHistory={addHistoryItem} />
        )}
        {selectedToolId === "compound-interest-calculator" && (
          <CompoundInterestDecisionEngine engineMode={activeEngineMode} currency={currency} onCopy={handleCopy} copied={copied} onLogHistory={addHistoryItem} />
        )}
        {selectedToolId === "date-difference-calculator" && (
          <DateDifferenceDecisionEngine engineMode={activeEngineMode} onCopy={handleCopy} copied={copied} onLogHistory={addHistoryItem} />
        )}
        {selectedToolId === "time-zone-converter" && (
          <TimeZoneDecisionEngine engineMode={activeEngineMode} onCopy={handleCopy} copied={copied} onLogHistory={addHistoryItem} />
        )}
        {selectedToolId === "unit-converter" && (
          <UnitDecisionEngine engineMode={activeEngineMode} onCopy={handleCopy} copied={copied} onLogHistory={addHistoryItem} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FULLY IMPLEMENTED ENGINES
// ─────────────────────────────────────────────────────────────────────────────

// 1. Percentage Engine
function PercentageDecisionEngine({ engineMode, currency, onCopy, copied, onLogHistory }: any) {
  const [p1, setP1] = useState<number>(15);
  const [v1, setV1] = useState<number>(250);
  const [targetResult, setTargetResult] = useState<number>(550);
  const [targetPercent, setTargetPercent] = useState<number>(10);

  const [optA, setOptA] = useState({ pct: 10, amount: 200 });
  const [optB, setOptB] = useState({ pct: 15, amount: 200 });
  const [optC, setOptC] = useState({ pct: 20, amount: 200 });

  const resStandard = useMemo(() => (p1 / 100) * v1, [p1, v1]);
  const requiredBase = useMemo(() => {
    const factor = 1 + targetPercent / 100;
    return factor !== 0 ? targetResult / factor : 0;
  }, [targetResult, targetPercent]);

  useEffect(() => {
    if (engineMode === "standard") {
      onLogHistory("Percentage", `${p1}% of ${currency}${v1} = ${currency}${resStandard.toFixed(2)}`, `Formula: (${p1}/100) * ${v1}`);
    }
  }, [p1, v1, engineMode]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Percent className="w-5 h-5 text-blue-500" /> Percentage Decision Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Evaluate percentage growth, solve required starting bases in reverse, or compare 3 margin strategies.
          </p>
        </div>
      </div>

      {engineMode === "standard" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Percentage (%)</label>
              <input type="number" value={p1} onChange={(e) => setP1(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Total Base Amount ({currency})</label>
              <input type="number" value={v1} onChange={(e) => setV1(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Result Output</span>
              <button onClick={() => onCopy(`${p1}% of ${currency}${v1} = ${currency}${resStandard.toFixed(2)}`)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1.5">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="text-3xl font-extrabold text-white">{currency}{resStandard.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-blue-200 font-mono">Formula: ({p1} / 100) × {v1} = {resStandard.toFixed(2)}</p>
          </div>
        </div>
      )}

      {engineMode === "reverse" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Target Final Value ({currency})</label>
              <input type="number" value={targetResult} onChange={(e) => setTargetResult(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Applied Growth (%)</label>
              <input type="number" value={targetPercent} onChange={(e) => setTargetPercent(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-4">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">Required Starting Base</span>
            <div className="text-3xl font-extrabold text-emerald-400">{currency}{requiredBase.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-indigo-200 font-mono">To reach {currency}{targetResult} with a {targetPercent}% growth, your starting base must be {currency}{requiredBase.toFixed(2)}.</p>
          </div>
        </div>
      )}

      {engineMode === "compare" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{ label: "Option A", state: optA, set: setOptA }, { label: "Option B", state: optB, set: setOptB }, { label: "Option C", state: optC, set: setOptC }].map((opt, idx) => {
            const res = (opt.state.pct / 100) * opt.state.amount;
            return (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">{opt.label}</span>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Percentage (%)</label>
                  <input type="number" value={opt.state.pct} onChange={(e) => opt.set({ ...opt.state, pct: Number(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Base Amount ({currency})</label>
                  <input type="number" value={opt.state.amount} onChange={(e) => opt.set({ ...opt.state, amount: Number(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white" />
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 block">Calculated Result</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">{currency}{res.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {engineMode === "sensitivity" && (
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Sensitivity Variance Matrix (Base: {currency}{v1})</span>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead><tr className="border-b border-slate-800 text-slate-400"><th className="py-2">Rate</th><th className="py-2">Calculated Value</th><th className="py-2">Variance</th></tr></thead>
              <tbody className="divide-y divide-slate-800">
                {[-5, -2, 0, 2, 5, 10].map((step) => {
                  const rate = Math.max(0, p1 + step);
                  const val = (rate / 100) * v1;
                  const diff = val - resStandard;
                  return (
                    <tr key={step} className={step === 0 ? "bg-blue-500/10 font-bold" : ""}>
                      <td className="py-2 font-mono">{rate}% {step === 0 && "(Current)"}</td>
                      <td className="py-2 font-mono">{currency}{val.toFixed(2)}</td>
                      <td className={`py-2 font-mono ${diff >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{diff >= 0 ? `+${currency}${diff.toFixed(2)}` : `-${currency}${Math.abs(diff).toFixed(2)}`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// 2. Age Engine
function AgeDecisionEngine({ engineMode, onCopy, copied, onLogHistory }: any) {
  const [birthDate, setBirthDate] = useState<string>("1998-05-15");
  const [targetAgeYears, setTargetAgeYears] = useState<number>(30);

  const ageData = useMemo(() => {
    const start = new Date(birthDate);
    const end = new Date();
    if (isNaN(start.getTime())) return null;
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return { years, months, days, totalDays };
  }, [birthDate]);

  const targetDateCalculated = useMemo(() => {
    const start = new Date(birthDate);
    if (isNaN(start.getTime())) return "";
    const target = new Date(start.getFullYear() + targetAgeYears, start.getMonth(), start.getDate());
    return target.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }, [birthDate, targetAgeYears]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" /> Chronological Age & Timeline Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate precise chronological age, project future milestones, or discover when you turn target ages.
          </p>
        </div>
      </div>

      {engineMode === "standard" && ageData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Date of Birth</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white space-y-4">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider block">Exact Age</span>
            <div className="text-3xl font-extrabold text-white">{ageData.years} Yrs, {ageData.months} Mos, {ageData.days} Days</div>
            <p className="text-xs text-blue-200 font-mono">Total Days Lived: {ageData.totalDays.toLocaleString()} Days</p>
          </div>
        </div>
      )}

      {engineMode === "reverse" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Date of Birth</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Target Milestone Age (Years)</label>
              <input type="number" value={targetAgeYears} onChange={(e) => setTargetAgeYears(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-4">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">Target Milestone Date</span>
            <div className="text-2xl font-extrabold text-emerald-400">{targetDateCalculated}</div>
            <p className="text-xs text-indigo-200 font-mono">You will turn exactly {targetAgeYears} years old on {targetDateCalculated}.</p>
          </div>
        </div>
      )}

      {(engineMode === "compare" || engineMode === "sensitivity") && (
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Milestone Age Horizon Timeline</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[30, 40, 50, 60, 65, 70, 80, 100].map((mAge) => {
              const start = new Date(birthDate);
              const mDate = new Date(start.getFullYear() + mAge, start.getMonth(), start.getDate());
              return (
                <div key={mAge} className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <span className="text-slate-400 block font-bold">Age {mAge}</span>
                  <span className="text-white font-mono font-bold mt-1 block">{mDate.getFullYear()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// 3. Discount Engine
function DiscountDecisionEngine({ engineMode, currency, onCopy, copied, onLogHistory }: any) {
  const [price, setPrice] = useState<number>(150);
  const [disc, setDisc] = useState<number>(20);
  const [targetBudget, setTargetBudget] = useState<number>(100);

  const [optA, setOptA] = useState({ price: 200, disc: 20 });
  const [optB, setOptB] = useState({ price: 180, disc: 15 });
  const [optC, setOptC] = useState({ price: 150, disc: 10 });

  const finalPrice = useMemo(() => price * (1 - disc / 100), [price, disc]);
  const reqDiscount = useMemo(() => {
    if (price <= 0) return 0;
    return Math.max(0, ((price - targetBudget) / price) * 100);
  }, [price, targetBudget]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-500" /> Discount & Promo Decision Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate final prices, solve required discount % in reverse to hit budget targets, or compare deals.
          </p>
        </div>
      </div>

      {engineMode === "standard" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Original Sticker Price ({currency})</label>
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Discount (%)</label>
              <input type="number" value={disc} onChange={(e) => setDisc(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900 to-slate-900 text-white space-y-4">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">Final Checkout Price</span>
            <div className="text-3xl font-extrabold text-white">{currency}{finalPrice.toFixed(2)}</div>
            <p className="text-xs text-emerald-200 font-mono">You Save: {currency}{(price - finalPrice).toFixed(2)} ({disc}% Off)</p>
          </div>
        </div>
      )}

      {engineMode === "reverse" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Original Price ({currency})</label>
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Target Budget Limit ({currency})</label>
              <input type="number" value={targetBudget} onChange={(e) => setTargetBudget(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-4">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">Required Discount Coupon</span>
            <div className="text-3xl font-extrabold text-emerald-400">{reqDiscount.toFixed(1)}% OFF</div>
            <p className="text-xs text-indigo-200 font-mono">To buy {currency}{price} item for {currency}{targetBudget}, ask for a {reqDiscount.toFixed(1)}% discount.</p>
          </div>
        </div>
      )}

      {engineMode === "compare" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{ label: "Deal A", state: optA, set: setOptA }, { label: "Deal B", state: optB, set: setOptB }, { label: "Deal C", state: optC, set: setOptC }].map((d, idx) => {
            const finalD = d.state.price * (1 - d.state.disc / 100);
            return (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">{d.label}</span>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Sticker Price ({currency})</label>
                  <input type="number" value={d.state.price} onChange={(e) => d.set({ ...d.state, price: Number(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border text-xs text-slate-900 dark:text-white dark:bg-slate-900" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Discount (%)</label>
                  <input type="number" value={d.state.disc} onChange={(e) => d.set({ ...d.state, disc: Number(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border text-xs text-slate-900 dark:text-white dark:bg-slate-900" />
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 block">Final Price</span>
                  <span className="text-xl font-black text-emerald-500">{currency}{finalD.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {engineMode === "sensitivity" && (
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Discount Sensitivity Matrix (Sticker: {currency}{price})</span>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead><tr className="border-b border-slate-800 text-slate-400"><th className="py-2">Discount %</th><th className="py-2">Final Price</th><th className="py-2">Total Savings</th></tr></thead>
              <tbody className="divide-y divide-slate-800">
                {[5, 10, 15, 20, 25, 30, 40, 50].map((dRate) => {
                  const fp = price * (1 - dRate / 100);
                  return (
                    <tr key={dRate} className={dRate === disc ? "bg-blue-500/10 font-bold" : ""}>
                      <td className="py-2 font-mono">{dRate}% {dRate === disc && "(Current)"}</td>
                      <td className="py-2 font-mono">{currency}{fp.toFixed(2)}</td>
                      <td className="py-2 font-mono text-emerald-400">+{currency}{(price - fp).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// 4. GST / Tax Engine
function GstTaxDecisionEngine({ engineMode, currency, onCopy, copied, onLogHistory }: any) {
  const [base, setBase] = useState<number>(1000);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [targetGross, setTargetGross] = useState<number>(1180);

  const taxAmount = useMemo(() => (taxRate / 100) * base, [base, taxRate]);
  const grossTotal = useMemo(() => base + taxAmount, [base, taxAmount]);

  const reqBaseForGross = useMemo(() => {
    const factor = 1 + taxRate / 100;
    return factor > 0 ? targetGross / factor : 0;
  }, [targetGross, taxRate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-500" /> GST & Tax Decision Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate gross tax-inclusive prices or extract net base amounts in reverse.
          </p>
        </div>
      </div>

      {engineMode === "standard" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Net Base Amount ({currency})</label>
              <input type="number" value={base} onChange={(e) => setBase(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Tax Rate (%)</label>
              <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white space-y-4">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider block">Gross Total Amount</span>
            <div className="text-3xl font-extrabold text-white">{currency}{grossTotal.toFixed(2)}</div>
            <p className="text-xs text-blue-200 font-mono">Tax ({taxRate}%): +{currency}{taxAmount.toFixed(2)}</p>
          </div>
        </div>
      )}

      {engineMode === "reverse" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Target Gross Price ({currency})</label>
              <input type="number" value={targetGross} onChange={(e) => setTargetGross(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Tax Rate (%)</label>
              <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-4">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">Extracted Base Amount</span>
            <div className="text-3xl font-extrabold text-emerald-400">{currency}{reqBaseForGross.toFixed(2)}</div>
            <p className="text-xs text-indigo-200 font-mono">Embedded Tax: {currency}{(targetGross - reqBaseForGross).toFixed(2)}</p>
          </div>
        </div>
      )}

      {(engineMode === "compare" || engineMode === "sensitivity") && (
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Standard Regional Tax Rate Matrix (Base: {currency}{base})</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[5, 12, 18, 20, 25, 28].map((tr) => {
              const g = base * (1 + tr / 100);
              return (
                <div key={tr} className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <span className="text-slate-400 block">{tr}% Tax Rate</span>
                  <span className="text-emerald-400 font-mono font-bold mt-1 block">{currency}{g.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// 5. EMI Loan Engine
function EmiLoanDecisionEngine({ engineMode, currency, onCopy, copied, onLogHistory }: any) {
  const [p, setP] = useState<number>(250000);
  const [r, setR] = useState<number>(7.5);
  const [y, setY] = useState<number>(15);

  const [targetBudgetEmi, setTargetBudgetEmi] = useState<number>(2000);

  const [bankA, setBankA] = useState({ p: 250000, r: 7.5, y: 15 });
  const [bankB, setBankB] = useState({ p: 250000, r: 6.8, y: 15 });
  const [bankC, setBankC] = useState({ p: 250000, r: 8.2, y: 15 });

  const calculateEmi = (loan: number, rate: number, years: number) => {
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;
    if (monthlyRate === 0) return loan / months;
    return (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  };

  const currentEmi = useMemo(() => calculateEmi(p, r, y), [p, r, y]);
  const totalInterest = useMemo(() => currentEmi * y * 12 - p, [currentEmi, p, y]);

  // Reverse Loan Solver: "Given target monthly EMI, max loan affordable"
  const maxAffordableLoan = useMemo(() => {
    const monthlyRate = r / 12 / 100;
    const months = y * 12;
    if (monthlyRate === 0) return targetBudgetEmi * months;
    return (targetBudgetEmi * (Math.pow(1 + monthlyRate, months) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, months));
  }, [targetBudgetEmi, r, y]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-500" /> EMI & Loan Scenario Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate EMI schedules, solve max affordable loan amount in reverse, or compare bank offers side-by-side.
          </p>
        </div>
      </div>

      {engineMode === "standard" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Loan Principal ({currency})</span>
                <span className="font-bold">{currency}{p.toLocaleString()}</span>
              </div>
              <input type="range" min={10000} max={1000000} step={5000} value={p} onChange={(e) => setP(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Interest Rate (%)</span>
                <span className="font-bold">{r}%</span>
              </div>
              <input type="range" min={1} max={25} step={0.1} value={r} onChange={(e) => setR(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Tenure ({y} Years)</span>
                <span className="font-bold">{y} Yrs</span>
              </div>
              <input type="range" min={1} max={30} step={1} value={y} onChange={(e) => setY(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white space-y-4">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider block">Monthly EMI Payment</span>
            <div className="text-3xl font-extrabold text-emerald-400">{currency}{currentEmi.toFixed(2)}</div>
            <p className="text-xs text-blue-200 font-mono">Total Interest Overhead: {currency}{totalInterest.toFixed(2)}</p>
          </div>
        </div>
      )}

      {engineMode === "reverse" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Target Monthly Budget ({currency}/mo)</label>
              <input type="number" value={targetBudgetEmi} onChange={(e) => setTargetBudgetEmi(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Interest Rate (%)</label>
              <input type="number" value={r} onChange={(e) => setR(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Tenure (Years)</label>
              <input type="number" value={y} onChange={(e) => setY(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-4">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">Max Affordable Loan Principal</span>
            <div className="text-3xl font-extrabold text-emerald-400">{currency}{maxAffordableLoan.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-indigo-200 font-mono">With a {currency}{targetBudgetEmi}/mo budget at {r}% over {y} years, you can borrow up to {currency}{maxAffordableLoan.toFixed(0)}.</p>
          </div>
        </div>
      )}

      {engineMode === "compare" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{ label: "Bank A", state: bankA, set: setBankA }, { label: "Bank B", state: bankB, set: setBankB }, { label: "Bank C", state: bankC, set: setBankC }].map((b, idx) => {
            const emi = calculateEmi(b.state.p, b.state.r, b.state.y);
            const totInt = emi * b.state.y * 12 - b.state.p;
            return (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">{b.label}</span>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Interest Rate (%)</label>
                  <input type="number" value={b.state.r} onChange={(e) => b.set({ ...b.state, r: Number(e.target.value) })} className="w-full px-3 py-1 rounded-lg border text-xs text-slate-900 dark:text-white dark:bg-slate-900" />
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 block">Monthly EMI</span>
                  <span className="text-xl font-black text-emerald-500">{currency}{emi.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Total Interest: {currency}{totInt.toFixed(0)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {engineMode === "sensitivity" && (
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Loan Interest Sensitivity Table</span>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead><tr className="border-b border-slate-800 text-slate-400"><th className="py-2">Interest Rate</th><th className="py-2">Monthly EMI</th><th className="py-2">Total Interest</th></tr></thead>
              <tbody className="divide-y divide-slate-800">
                {[5.0, 6.0, 7.0, 7.5, 8.0, 9.0, 10.0].map((rate) => {
                  const emi = calculateEmi(p, rate, y);
                  const totInt = emi * y * 12 - p;
                  return (
                    <tr key={rate} className={rate === r ? "bg-blue-500/10 font-bold" : ""}>
                      <td className="py-2 font-mono">{rate}% {rate === r && "(Current)"}</td>
                      <td className="py-2 font-mono">{currency}{emi.toFixed(2)}</td>
                      <td className="py-2 font-mono text-amber-400">{currency}{totInt.toFixed(0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// 6. Salary Engine
function SalaryDecisionEngine({ engineMode, currency, onCopy, copied, onLogHistory }: any) {
  const [wage, setWage] = useState<number>(45);
  const [hrs, setHrs] = useState<number>(40);
  const [tax, setTax] = useState<number>(20);
  const [targetNetMonthly, setTargetNetMonthly] = useState<number>(5000);

  const annualGross = useMemo(() => wage * hrs * 52, [wage, hrs]);
  const monthlyNet = useMemo(() => (annualGross * (1 - tax / 100)) / 12, [annualGross, tax]);

  const reqHourlyWageForTargetNet = useMemo(() => {
    const annualNetReq = targetNetMonthly * 12;
    const annualGrossReq = tax < 100 ? annualNetReq / (1 - tax / 100) : 0;
    return annualGrossReq / (hrs * 52);
  }, [targetNetMonthly, tax, hrs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-500" /> Salary & Job Offer Decision Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Convert hourly wages to annual pay or solve required hourly rates in reverse to hit take-home targets.
          </p>
        </div>
      </div>

      {engineMode === "standard" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Hourly Wage ({currency}/hr)</label>
              <input type="number" value={wage} onChange={(e) => setWage(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Hours Per Week</label>
              <input type="number" value={hrs} onChange={(e) => setHrs(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Estimated Tax (%)</label>
              <input type="number" value={tax} onChange={(e) => setTax(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 text-white space-y-4">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider block">Net Take-Home Pay</span>
            <div className="text-3xl font-extrabold text-emerald-400">{currency}{monthlyNet.toFixed(2)}/mo</div>
            <p className="text-xs text-blue-200 font-mono">Annual Gross: {currency}{annualGross.toLocaleString()}</p>
          </div>
        </div>
      )}

      {engineMode === "reverse" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Target Net Monthly Take-Home ({currency})</label>
              <input type="number" value={targetNetMonthly} onChange={(e) => setTargetNetMonthly(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Estimated Tax Bracket (%)</label>
              <input type="number" value={tax} onChange={(e) => setTax(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-4">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">Required Hourly Wage Rate</span>
            <div className="text-3xl font-extrabold text-emerald-400">{currency}{reqHourlyWageForTargetNet.toFixed(2)}/hr</div>
            <p className="text-xs text-indigo-200 font-mono">Equivalent Required Annual Gross: {currency}{(reqHourlyWageForTargetNet * hrs * 52).toFixed(0)}/yr</p>
          </div>
        </div>
      )}

      {(engineMode === "compare" || engineMode === "sensitivity") && (
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Salary & Hours Scale Matrix</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[25, 35, 45, 55, 65, 75, 85, 100].map((w) => {
              const netM = (w * hrs * 52 * (1 - tax / 100)) / 12;
              return (
                <div key={w} className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <span className="text-slate-400 block">{currency}{w}/hr ({hrs} hrs/wk)</span>
                  <span className="text-emerald-400 font-mono font-bold mt-1 block">{currency}{netM.toFixed(0)}/mo Net</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// 7. Compound Interest Engine
function CompoundInterestDecisionEngine({ engineMode, currency, onCopy, copied, onLogHistory }: any) {
  const [init, setInit] = useState<number>(5000);
  const [monthly, setMonthly] = useState<number>(300);
  const [rate, setRate] = useState<number>(8);
  const [years, setYears] = useState<number>(10);

  const [targetWealthGoal, setTargetWealthGoal] = useState<number>(250000);

  const compoundData = useMemo(() => {
    let total = init;
    let totalDep = init;
    for (let m = 1; m <= years * 12; m++) {
      total += monthly;
      totalDep += monthly;
      total += total * (rate / 100 / 12);
    }
    return { finalBalance: total, totalDep, interest: total - totalDep };
  }, [init, monthly, rate, years]);

  // Reverse Solver: "Required monthly deposit to reach target wealth goal"
  const reqMonthlyForGoal = useMemo(() => {
    const months = years * 12;
    const rMonthly = rate / 100 / 12;
    if (rMonthly === 0) return Math.max(0, (targetWealthGoal - init) / months);

    // FV = Init * (1+r)^n + Monthly * [((1+r)^n - 1)/r]
    const initFutureVal = init * Math.pow(1 + rMonthly, months);
    const remGoal = targetWealthGoal - initFutureVal;
    if (remGoal <= 0) return 0;

    const annuityFactor = (Math.pow(1 + rMonthly, months) - 1) / rMonthly;
    return remGoal / annuityFactor;
  }, [targetWealthGoal, init, rate, years]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" /> Compound Wealth Decision Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Forecast long-term compounding growth or solve required monthly contributions in reverse to hit wealth goals.
          </p>
        </div>
      </div>

      {engineMode === "standard" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Initial Principal ({currency})</label>
              <input type="number" value={init} onChange={(e) => setInit(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Monthly Contribution ({currency})</label>
              <input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Return Rate (%)</label>
                <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Horizon ({years} Yrs)</label>
                <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white space-y-4">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider block">Future Portfolio Value</span>
            <div className="text-3xl font-extrabold text-emerald-400">{currency}{compoundData.finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-blue-200 font-mono">Compounded Interest Earned: +{currency}{compoundData.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      )}

      {engineMode === "reverse" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Target Wealth Goal ({currency})</label>
              <input type="number" value={targetWealthGoal} onChange={(e) => setTargetWealthGoal(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Expected Return (%)</label>
              <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Investment Horizon (Years)</label>
              <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-4">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">Required Monthly Contribution</span>
            <div className="text-3xl font-extrabold text-emerald-400">{currency}{reqMonthlyForGoal.toFixed(2)}/mo</div>
            <p className="text-xs text-indigo-200 font-mono">To accumulate {currency}{targetWealthGoal.toLocaleString()} in {years} years at {rate}%, save {currency}{reqMonthlyForGoal.toFixed(2)} every month.</p>
          </div>
        </div>
      )}

      {(engineMode === "compare" || engineMode === "sensitivity") && (
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Return Rate Sensitivity Table ({years} Yrs)</span>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead><tr className="border-b border-slate-800 text-slate-400"><th className="py-2">Annual Return</th><th className="py-2">Final Portfolio</th><th className="py-2">Compounded Interest</th></tr></thead>
              <tbody className="divide-y divide-slate-800">
                {[5, 6, 7, 8, 9, 10, 12, 15].map((rStep) => {
                  let tot = init;
                  let dep = init;
                  for (let m = 1; m <= years * 12; m++) {
                    tot += monthly;
                    dep += monthly;
                    tot += tot * (rStep / 100 / 12);
                  }
                  return (
                    <tr key={rStep} className={rStep === rate ? "bg-blue-500/10 font-bold" : ""}>
                      <td className="py-2 font-mono">{rStep}% {rStep === rate && "(Current)"}</td>
                      <td className="py-2 font-mono">{currency}{tot.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="py-2 font-mono text-emerald-400">+{currency}{(tot - dep).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// 8. Date Difference Engine
function DateDifferenceDecisionEngine({ engineMode, onCopy, copied, onLogHistory }: any) {
  const [startDate, setStartDate] = useState<string>("2025-01-01");
  const [endDate, setEndDate] = useState<string>("2025-12-31");
  const [daysOffset, setDaysOffset] = useState<number>(90);

  const diffData = useMemo(() => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;

    const totalDays = Math.abs(Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
    let businessDays = 0;
    const curr = new Date(Math.min(s.getTime(), e.getTime()));
    const finalDate = new Date(Math.max(s.getTime(), e.getTime()));

    while (curr <= finalDate) {
      const day = curr.getDay();
      if (day !== 0 && day !== 6) businessDays++;
      curr.setDate(curr.getDate() + 1);
    }
    return { totalDays, businessDays };
  }, [startDate, endDate]);

  const offsetTargetDate = useMemo(() => {
    const s = new Date(startDate);
    if (isNaN(s.getTime())) return "";
    s.setDate(s.getDate() + daysOffset);
    return s.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }, [startDate, daysOffset]);

  useEffect(() => {
    if (diffData) {
      onLogHistory("Date Difference", `${diffData.totalDays} Total Days (${diffData.businessDays} Working Days)`, `From ${startDate} to ${endDate}`);
    }
  }, [startDate, endDate, diffData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" /> Date Difference & Timeline Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Calculate calendar durations or solve date offsets in reverse.</p>
        </div>
      </div>

      {engineMode === "standard" && diffData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border space-y-4">
            <div><label className="text-xs font-medium block mb-1">Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" /></div>
            <div><label className="text-xs font-medium block mb-1">End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" /></div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 text-white space-y-4">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider block">Duration Summary</span>
            <div className="text-3xl font-extrabold text-white">{diffData.totalDays} Calendar Days</div>
            <p className="text-xs text-emerald-400 font-mono">Business Working Days (Mon-Fri): {diffData.businessDays} Days</p>
          </div>
        </div>
      )}

      {engineMode === "reverse" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border space-y-4">
            <div><label className="text-xs font-medium block mb-1">Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" /></div>
            <div><label className="text-xs font-medium block mb-1">Day Offset (+/- Days)</label><input type="number" value={daysOffset} onChange={(e) => setDaysOffset(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" /></div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-4">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">Target Offset Date</span>
            <div className="text-2xl font-extrabold text-emerald-400">{offsetTargetDate}</div>
            <p className="text-xs text-indigo-200 font-mono">Adding {daysOffset} days to {startDate} lands on {offsetTargetDate}.</p>
          </div>
        </div>
      )}

      {(engineMode === "compare" || engineMode === "sensitivity") && diffData && (
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Timeline Offset Scale Matrix (Base: {startDate})</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[30, 60, 90, 180, 365].map((off) => {
              const d = new Date(startDate);
              d.setDate(d.getDate() + off);
              return (
                <div key={off} className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <span className="text-slate-400 block font-bold">+{off} Days</span>
                  <span className="text-emerald-400 font-mono font-bold mt-1 block">{d.toISOString().split("T")[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// 9. Time Zone Engine
function TimeZoneDecisionEngine({ engineMode, onCopy, copied, onLogHistory }: any) {
  const TIMEZONES = [
    { name: "UTC", zone: "UTC" },
    { name: "New York (EST / EDT)", zone: "America/New_York" },
    { name: "London (GMT / BST)", zone: "Europe/London" },
    { name: "Paris / Berlin (CET)", zone: "Europe/Paris" },
    { name: "Tokyo (JST)", zone: "Asia/Tokyo" },
    { name: "India (IST)", zone: "Asia/Kolkata" },
    { name: "San Francisco (PST / PDT)", zone: "America/Los_Angeles" },
  ];

  const [baseTime, setBaseTime] = useState<string>("14:00");
  const [baseZone, setBaseZone] = useState<string>("UTC");

  const formattedTimes = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const [hrs, mins] = baseTime.split(":").map(Number);

    const tempUtc = new Date(Date.UTC(2025, 5, 1, hrs || 0, mins || 0));
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: baseZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(tempUtc);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "00";
    const formattedBaseStr = `${getPart("year")}-${getPart("month")}-${getPart("day")}T${getPart("hour")}:${getPart("minute")}:00`;

    const sourceTimestamp = new Date(`${today}T${baseTime}:00`).getTime();
    const baseOffsetMs = new Date(formattedBaseStr).getTime() - tempUtc.getTime();
    const targetUtcTimestamp = sourceTimestamp - baseOffsetMs;
    const targetDate = new Date(targetUtcTimestamp);

    return TIMEZONES.map((tz) => {
      try {
        const timeStr = targetDate.toLocaleTimeString("en-US", {
          timeZone: tz.zone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        return { name: tz.name, zone: tz.zone, time: timeStr };
      } catch {
        return { name: tz.name, zone: tz.zone, time: baseTime };
      }
    });
  }, [baseTime, baseZone]);

  useEffect(() => {
    onLogHistory("Time Zone", `Source: ${baseTime} (${baseZone})`, formattedTimes.map((t) => `${t.name}: ${t.time}`).join(" | "));
  }, [baseTime, baseZone]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" /> Time Zone Meeting Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Convert times between global regions instantly with IANA DST compliance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1">Source Time</label>
            <input type="time" value={baseTime} onChange={(e) => setBaseTime(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Source Time Zone</label>
            <select value={baseZone} onChange={(e) => setBaseZone(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white">
              {TIMEZONES.map((tz) => (
                <option key={tz.zone} value={tz.zone}>{tz.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900 text-white space-y-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Global Overlap Timelines</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {formattedTimes.map((item) => (
              <div key={item.zone} className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">{item.name}</span>
                <span className="text-sm font-bold text-emerald-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 10. Unit Converter Engine
function UnitDecisionEngine({ engineMode, onCopy, copied, onLogHistory }: any) {
  const UNIT_TYPES = {
    length: {
      label: "Length",
      units: {
        m: { label: "Meters (m)", factor: 1 },
        km: { label: "Kilometers (km)", factor: 1000 },
        cm: { label: "Centimeters (cm)", factor: 0.01 },
        mm: { label: "Millimeters (mm)", factor: 0.001 },
        mi: { label: "Miles (mi)", factor: 1609.34 },
        ft: { label: "Feet (ft)", factor: 0.3048 },
        in: { label: "Inches (in)", factor: 0.0254 },
      },
    },
    weight: {
      label: "Mass / Weight",
      units: {
        kg: { label: "Kilograms (kg)", factor: 1 },
        g: { label: "Grams (g)", factor: 0.001 },
        mg: { label: "Milligrams (mg)", factor: 0.000001 },
        lb: { label: "Pounds (lbs)", factor: 0.453592 },
        oz: { label: "Ounces (oz)", factor: 0.0283495 },
      },
    },
    temperature: {
      label: "Temperature",
      units: {
        C: { label: "Celsius (°C)", factor: 1 },
        F: { label: "Fahrenheit (°F)", factor: 1 },
        K: { label: "Kelvin (K)", factor: 1 },
      },
    },
    area: {
      label: "Area",
      units: {
        sqm: { label: "Square Meters (m²)", factor: 1 },
        sqkm: { label: "Square Kilometers (km²)", factor: 1000000 },
        sqft: { label: "Square Feet (ft²)", factor: 0.092903 },
        acre: { label: "Acres", factor: 4046.86 },
        hectare: { label: "Hectares", factor: 10000 },
      },
    },
    volume: {
      label: "Volume",
      units: {
        L: { label: "Liters (L)", factor: 1 },
        mL: { label: "Milliliters (mL)", factor: 0.001 },
        gal: { label: "Gallons (US)", factor: 3.78541 },
        cup: { label: "Cups (US)", factor: 0.236588 },
      },
    },
    speed: {
      label: "Speed",
      units: {
        mps: { label: "Meters/sec (m/s)", factor: 1 },
        kph: { label: "Kilometers/hr (km/h)", factor: 0.277778 },
        mph: { label: "Miles/hr (mph)", factor: 0.44704 },
        knot: { label: "Knots (kn)", factor: 0.514444 },
      },
    },
    data: {
      label: "Digital Data Storage",
      units: {
        B: { label: "Bytes (B)", factor: 1 },
        KB: { label: "Kilobytes (KB)", factor: 1024 },
        MB: { label: "Megabytes (MB)", factor: 1048576 },
        GB: { label: "Gigabytes (GB)", factor: 1073741824 },
        TB: { label: "Terabytes (TB)", factor: 1099511627776 },
      },
    },
  };

  const [category, setCategory] = useState<keyof typeof UNIT_TYPES>("length");
  const [val, setVal] = useState<number>(100);
  const [fromUnit, setFromUnit] = useState<string>("m");
  const [toUnit, setToUnit] = useState<string>("ft");

  const result = useMemo(() => {
    if (category === "temperature") {
      if (fromUnit === toUnit) return val;
      if (fromUnit === "C" && toUnit === "F") return (val * 9) / 5 + 32;
      if (fromUnit === "C" && toUnit === "K") return val + 273.15;
      if (fromUnit === "F" && toUnit === "C") return ((val - 32) * 5) / 9;
      if (fromUnit === "F" && toUnit === "K") return ((val - 32) * 5) / 9 + 273.15;
      if (fromUnit === "K" && toUnit === "C") return val - 273.15;
      if (fromUnit === "K" && toUnit === "F") return ((val - 273.15) * 9) / 5 + 32;
      return val;
    }

    const cat = UNIT_TYPES[category];
    const uFrom = (cat.units as any)[fromUnit];
    const uTo = (cat.units as any)[toUnit];
    if (!uFrom || !uTo) return 0;

    const baseVal = val * uFrom.factor;
    return baseVal / uTo.factor;
  }, [category, val, fromUnit, toUnit]);

  useEffect(() => {
    onLogHistory("Unit Converter", `${val} ${fromUnit} = ${result.toFixed(4)} ${toUnit}`, `Category: ${UNIT_TYPES[category].label}`);
  }, [category, val, fromUnit, toUnit, result]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-500" /> Multi-Dimensional Unit Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Convert metric and imperial units across 7 physical dimensions.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(UNIT_TYPES) as Array<keyof typeof UNIT_TYPES>).map((catKey) => (
          <button
            key={catKey}
            onClick={() => {
              setCategory(catKey);
              const firstUnits = Object.keys(UNIT_TYPES[catKey].units);
              setFromUnit(firstUnits[0]);
              setToUnit(firstUnits[1] || firstUnits[0]);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
              category === catKey ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            {UNIT_TYPES[catKey].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1">Value to Convert</label>
            <input type="number" value={val} onChange={(e) => setVal(Number(e.target.value))} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1">From</label>
              <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white">
                {Object.entries(UNIT_TYPES[category].units).map(([uKey, uObj]) => (
                  <option key={uKey} value={uKey}>{uObj.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">To</label>
              <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border text-sm dark:bg-slate-900 dark:text-white">
                {Object.entries(UNIT_TYPES[category].units).map(([uKey, uObj]) => (
                  <option key={uKey} value={uKey}>{uObj.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 text-white space-y-4">
          <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider block">Converted Output</span>
          <div className="text-3xl font-extrabold text-white">{result.toLocaleString(undefined, { maximumFractionDigits: 4 })} {toUnit}</div>
          <p className="text-xs text-blue-200">{val} {fromUnit} = {result.toFixed(4)} {toUnit}</p>
        </div>
      </div>
    </div>
  );
}
