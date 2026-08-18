"use client";

import React, { useState, useMemo } from "react";
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
  Sliders,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
  HelpCircle,
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

export function CalculatorWorkspace({ activeToolId }: CalculatorWorkspaceProps) {
  const [selectedToolId, setSelectedToolId] = useState<string>(
    activeToolId || "percentage-calculator"
  );
  const [currency, setCurrency] = useState<string>("$");
  const [copied, setCopied] = useState<boolean>(false);

  // Sync state if activeToolId prop changes
  React.useEffect(() => {
    if (activeToolId) {
      setSelectedToolId(activeToolId);
    }
  }, [activeToolId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Workspace Header & Navigation Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Calculator Workspace
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  100% In-Browser & Private
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Instant calculations, What-If scenario simulations, and visual formula breakdowns.
              </p>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.symbol}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-tool selector tabs */}
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
      </div>

      {/* Active Sub-Calculator View */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        {selectedToolId === "percentage-calculator" && (
          <PercentageCalculatorSub currency={currency} onCopy={handleCopy} copied={copied} />
        )}
        {selectedToolId === "age-calculator" && (
          <AgeCalculatorSub onCopy={handleCopy} copied={copied} />
        )}
        {selectedToolId === "date-difference-calculator" && (
          <DateDifferenceSub onCopy={handleCopy} copied={copied} />
        )}
        {selectedToolId === "time-zone-converter" && (
          <TimeZoneConverterSub onCopy={handleCopy} copied={copied} />
        )}
        {selectedToolId === "unit-converter" && (
          <UnitConverterSub onCopy={handleCopy} copied={copied} />
        )}
        {selectedToolId === "discount-calculator" && (
          <DiscountCalculatorSub currency={currency} onCopy={handleCopy} copied={copied} />
        )}
        {selectedToolId === "gst-tax-calculator" && (
          <GstTaxCalculatorSub currency={currency} onCopy={handleCopy} copied={copied} />
        )}
        {selectedToolId === "emi-loan-calculator" && (
          <EmiLoanCalculatorSub currency={currency} onCopy={handleCopy} copied={copied} />
        )}
        {selectedToolId === "salary-calculator" && (
          <SalaryCalculatorSub currency={currency} onCopy={handleCopy} copied={copied} />
        )}
        {selectedToolId === "compound-interest-calculator" && (
          <CompoundInterestCalculatorSub currency={currency} onCopy={handleCopy} copied={copied} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-CALCULATOR COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// 1. Percentage Calculator
function PercentageCalculatorSub({
  currency,
  onCopy,
  copied,
}: {
  currency: string;
  onCopy: (txt: string) => void;
  copied: boolean;
}) {
  const [mode, setMode] = useState<"value" | "percent" | "change" | "reverse">("value");

  // Mode 1: What is X% of Y?
  const [p1, setP1] = useState<number>(15);
  const [v1, setV1] = useState<number>(250);

  // Mode 2: X is what % of Y?
  const [x2, setX2] = useState<number>(45);
  const [y2, setY2] = useState<number>(180);

  // Mode 3: Percentage change from A to B
  const [a3, setA3] = useState<number>(80);
  const [b3, setB3] = useState<number>(120);

  // Mode 4: Reverse Percentage (Value after X% tax/discount = Y, find original)
  const [f4, setF4] = useState<number>(115);
  const [pct4, setPct4] = useState<number>(15);

  const res1 = useMemo(() => (p1 / 100) * v1, [p1, v1]);
  const res2 = useMemo(() => (y2 !== 0 ? (x2 / y2) * 100 : 0), [x2, y2]);
  const res3 = useMemo(() => {
    if (a3 === 0) return 0;
    const diff = b3 - a3;
    return (diff / a3) * 100;
  }, [a3, b3]);
  const res4 = useMemo(() => {
    const factor = 1 + pct4 / 100;
    return factor !== 0 ? f4 / factor : 0;
  }, [f4, pct4]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Percent className="w-5 h-5 text-blue-500" /> Percentage Calculator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate values, relative ratios, growth percentage, and reverse tax amounts.
          </p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: "value", label: "X% of Y" },
          { id: "percent", label: "X is what % of Y" },
          { id: "change", label: "% Change (A → B)" },
          { id: "reverse", label: "Reverse %" },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as any)}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
              mode === m.id
                ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Inputs & Calculations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
          {mode === "value" && (
            <>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Percentage (%)
                </label>
                <input
                  type="number"
                  value={p1}
                  onChange={(e) => setP1(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Total Amount ({currency})
                </label>
                <input
                  type="number"
                  value={v1}
                  onChange={(e) => setV1(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </>
          )}

          {mode === "percent" && (
            <>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Part Value (X)
                </label>
                <input
                  type="number"
                  value={x2}
                  onChange={(e) => setX2(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Total Base (Y)
                </label>
                <input
                  type="number"
                  value={y2}
                  onChange={(e) => setY2(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </>
          )}

          {mode === "change" && (
            <>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Initial Value (A)
                </label>
                <input
                  type="number"
                  value={a3}
                  onChange={(e) => setA3(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Final Value (B)
                </label>
                <input
                  type="number"
                  value={b3}
                  onChange={(e) => setB3(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </>
          )}

          {mode === "reverse" && (
            <>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Final Amount After Markup/Tax ({currency})
                </label>
                <input
                  type="number"
                  value={f4}
                  onChange={(e) => setF4(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Applied Tax/Markup (%)
                </label>
                <input
                  type="number"
                  value={pct4}
                  onChange={(e) => setPct4(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </>
          )}
        </div>

        {/* Results Panel */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 text-white space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
              Result Breakdown
            </span>
            <button
              onClick={() => {
                let txt = "";
                if (mode === "value") txt = `${p1}% of ${currency}${v1} = ${currency}${res1.toFixed(2)}`;
                if (mode === "percent") txt = `${x2} of ${y2} = ${res2.toFixed(2)}%`;
                if (mode === "change") txt = `Change from ${a3} to ${b3} = ${res3.toFixed(2)}%`;
                if (mode === "reverse") txt = `Original amount prior to ${pct4}% markup = ${currency}${res4.toFixed(2)}`;
                onCopy(txt);
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Result"}
            </button>
          </div>

          <div className="py-2">
            {mode === "value" && (
              <div>
                <div className="text-3xl font-extrabold text-white">
                  {currency}
                  {res1.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-blue-200 mt-2 font-mono">
                  Formula: ({p1} / 100) × {v1} = {res1.toFixed(2)}
                </p>
              </div>
            )}

            {mode === "percent" && (
              <div>
                <div className="text-3xl font-extrabold text-white">{res2.toFixed(2)}%</div>
                <p className="text-xs text-blue-200 mt-2 font-mono">
                  Formula: ({x2} / {y2}) × 100 = {res2.toFixed(2)}%
                </p>
              </div>
            )}

            {mode === "change" && (
              <div>
                <div className="text-3xl font-extrabold text-white">
                  {res3 >= 0 ? `+${res3.toFixed(2)}%` : `${res3.toFixed(2)}%`}
                </div>
                <p className="text-xs text-blue-200 mt-2 font-mono">
                  Formula: (({b3} - {a3}) / {a3}) × 100 = {res3.toFixed(2)}%
                </p>
              </div>
            )}

            {mode === "reverse" && (
              <div>
                <div className="text-3xl font-extrabold text-white">
                  {currency}
                  {res4.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-blue-200 mt-2 font-mono">
                  Formula: {f4} / (1 + {pct4}/100) = {res4.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Age Calculator
function AgeCalculatorSub({
  onCopy,
  copied,
}: {
  onCopy: (txt: string) => void;
  copied: boolean;
}) {
  const [birthDate, setBirthDate] = useState<string>("1998-05-15");
  const [targetDate, setTargetDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const ageData = useMemo(() => {
    const start = new Date(birthDate);
    const end = new Date(targetDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return null;
    }

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

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;

    // Next birthday countdown
    const nextBday = new Date(end.getFullYear(), start.getMonth(), start.getDate());
    if (nextBday < end) {
      nextBday.setFullYear(end.getFullYear() + 1);
    }
    const daysToNextBday = Math.ceil(
      (nextBday.getTime() - end.getTime()) / (1000 * 60 * 60 * 24)
    );

    const dayOfWeek = start.toLocaleDateString("en-US", { weekday: "long" });

    return {
      years,
      months,
      days,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      daysToNextBday,
      dayOfWeek,
    };
  }, [birthDate, targetDate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" /> Chronological Age Calculator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate exact age down to the second and inspect next birthday countdowns.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              Age as of Target Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {ageData ? (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Exact Age Summary
              </span>
              <button
                onClick={() =>
                  onCopy(
                    `Age: ${ageData.years} Years, ${ageData.months} Months, ${ageData.days} Days (Born on ${ageData.dayOfWeek})`
                  )
                }
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {ageData.years} Years, {ageData.months} Months, {ageData.days} Days
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-white/10">
              <div>
                <span className="text-slate-400 block">Born On</span>
                <span className="font-semibold text-white">{ageData.dayOfWeek}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Next Birthday In</span>
                <span className="font-semibold text-emerald-400">{ageData.daysToNextBday} Days</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Days Lived</span>
                <span className="font-semibold text-white">{ageData.totalDays.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Hours</span>
                <span className="font-semibold text-white">{ageData.totalHours.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-xs">
            Please enter a valid birth date prior to target date.
          </div>
        )}
      </div>
    </div>
  );
}

// 3. Date Difference Calculator
function DateDifferenceSub({
  onCopy,
  copied,
}: {
  onCopy: (txt: string) => void;
  copied: boolean;
}) {
  const [startDate, setStartDate] = useState<string>("2025-01-01");
  const [endDate, setEndDate] = useState<string>("2025-12-31");
  const [excludeWeekends, setExcludeWeekends] = useState<boolean>(true);

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

    const weeks = Math.floor(totalDays / 7);
    const remDays = totalDays % 7;

    return { totalDays, businessDays, weeks, remDays };
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" /> Date Difference & Duration Calculator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate calendar days and business working days between two dates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {diffData && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Duration Summary
              </span>
              <button
                onClick={() =>
                  onCopy(
                    `Difference: ${diffData.totalDays} Total Days (${diffData.businessDays} Working Days)`
                  )
                }
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div>
              <div className="text-3xl font-extrabold text-white">
                {diffData.totalDays} Calendar Days
              </div>
              <p className="text-xs text-blue-200 mt-1">
                Equivalent to {diffData.weeks} weeks and {diffData.remDays} days
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300 block font-medium">Business Working Days</span>
                <span className="text-xs text-slate-400">(Excludes Saturdays & Sundays)</span>
              </div>
              <div className="text-xl font-bold text-emerald-400">{diffData.businessDays} Days</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 4. Time Zone Converter
function TimeZoneConverterSub({
  onCopy,
  copied,
}: {
  onCopy: (txt: string) => void;
  copied: boolean;
}) {
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

    // Resolve date in the base timezone using Intl
    const tempUtc = new Date(Date.UTC(2025, 5, 1, hrs || 0, mins || 0));

    // Construct local ISO string representation for base timezone
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

    // Compute UTC offset for base zone
    const parts = formatter.formatToParts(tempUtc);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "00";
    const formattedBaseStr = `${getPart("year")}-${getPart("month")}-${getPart("day")}T${getPart("hour")}:${getPart("minute")}:00`;

    // Convert to actual target timestamps
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" /> Time Zone Converter & Meeting Planner
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Convert local time across global regions instantly using standard IANA time zone rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              Source Time
            </label>
            <input
              type="time"
              value={baseTime}
              onChange={(e) => setBaseTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              Source Time Zone
            </label>
            <select
              value={baseZone}
              onChange={(e) => setBaseZone(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.zone} value={tz.zone}>
                  {tz.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900 text-white space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Global Time Mapping
            </span>
            <button
              onClick={() =>
                onCopy(
                  formattedTimes.map((t) => `${t.name}: ${t.time}`).join(" | ")
                )
              }
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied All" : "Copy Schedule"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {formattedTimes.map((item) => (
              <div
                key={item.zone}
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between"
              >
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

// 5. Unit Converter
function UnitConverterSub({
  onCopy,
  copied,
}: {
  onCopy: (txt: string) => void;
  copied: boolean;
}) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-500" /> Multi-Unit Converter
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Convert metric and imperial units across length, mass, and digital storage.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {(Object.keys(UNIT_TYPES) as Array<keyof typeof UNIT_TYPES>).map((catKey) => (
          <button
            key={catKey}
            onClick={() => {
              setCategory(catKey);
              const firstUnits = Object.keys(UNIT_TYPES[catKey].units);
              setFromUnit(firstUnits[0]);
              setToUnit(firstUnits[1] || firstUnits[0]);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              category === catKey
                ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            {UNIT_TYPES[catKey].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              Value to Convert
            </label>
            <input
              type="number"
              value={val}
              onChange={(e) => setVal(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">From</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
              >
                {Object.entries(UNIT_TYPES[category].units).map(([uKey, uObj]) => (
                  <option key={uKey} value={uKey}>
                    {uObj.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">To</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
              >
                {Object.entries(UNIT_TYPES[category].units).map(([uKey, uObj]) => (
                  <option key={uKey} value={uKey}>
                    {uObj.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 text-white space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
              Converted Output
            </span>
            <button
              onClick={() => onCopy(`${val} ${fromUnit} = ${result.toFixed(4)} ${toUnit}`)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="py-2">
            <div className="text-3xl font-extrabold text-white">
              {result.toLocaleString(undefined, { maximumFractionDigits: 4 })} {toUnit}
            </div>
            <p className="text-xs text-blue-200 mt-2">
              {val} {fromUnit} is equivalent to {result.toFixed(4)} {toUnit}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 6. Discount Calculator
function DiscountCalculatorSub({
  currency,
  onCopy,
  copied,
}: {
  currency: string;
  onCopy: (txt: string) => void;
  copied: boolean;
}) {
  const [originalPrice, setOriginalPrice] = useState<number>(150);
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [stackedDiscount, setStackedDiscount] = useState<number>(10);
  const [taxPercent, setTaxPercent] = useState<number>(8);

  const discountData = useMemo(() => {
    const firstDisc = (discountPercent / 100) * originalPrice;
    const priceAfterFirst = originalPrice - firstDisc;

    const secondDisc = (stackedDiscount / 100) * priceAfterFirst;
    const priceAfterSecond = priceAfterFirst - secondDisc;

    const taxAmount = (taxPercent / 100) * priceAfterSecond;
    const finalPrice = priceAfterSecond + taxAmount;

    const totalSaved = originalPrice - priceAfterSecond;

    return { firstDisc, secondDisc, priceAfterSecond, taxAmount, finalPrice, totalSaved };
  }, [originalPrice, discountPercent, stackedDiscount, taxPercent]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-500" /> Discount & Sale Savings Calculator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate final checkout prices with stacked discounts and tax inclusions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              Original Price ({currency})
            </label>
            <input
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Extra Stacked %
              </label>
              <input
                type="number"
                value={stackedDiscount}
                onChange={(e) => setStackedDiscount(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              Sales Tax Rate (%)
            </label>
            <input
              type="number"
              value={taxPercent}
              onChange={(e) => setTaxPercent(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
              Checkout Breakdown
            </span>
            <button
              onClick={() =>
                onCopy(
                  `Final Price: ${currency}${discountData.finalPrice.toFixed(2)} (You Save ${currency}${discountData.totalSaved.toFixed(2)})`
                )
              }
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {currency}
              {discountData.finalPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-blue-200 mt-1">
              Total Money Saved: {currency}{discountData.totalSaved.toFixed(2)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-3">
            <div>
              <span className="text-slate-400 block">Primary Discount</span>
              <span className="font-semibold text-white">-{currency}{discountData.firstDisc.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Stacked Discount</span>
              <span className="font-semibold text-white">-{currency}{discountData.secondDisc.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Estimated Tax</span>
              <span className="font-semibold text-white">+{currency}{discountData.taxAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 7. GST / Tax Calculator
function GstTaxCalculatorSub({
  currency,
  onCopy,
  copied,
}: {
  currency: string;
  onCopy: (txt: string) => void;
  copied: boolean;
}) {
  const [type, setType] = useState<"add" | "remove">("add");
  const [amount, setAmount] = useState<number>(1000);
  const [taxRate, setTaxRate] = useState<number>(18);

  const taxData = useMemo(() => {
    if (type === "add") {
      const taxVal = (taxRate / 100) * amount;
      const total = amount + taxVal;
      return { base: amount, tax: taxVal, total };
    } else {
      const base = amount / (1 + taxRate / 100);
      const taxVal = amount - base;
      return { base, tax: taxVal, total: amount };
    }
  }, [type, amount, taxRate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-500" /> GST & Tax Calculator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate Tax-Inclusive or Tax-Exclusive rates instantly.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setType("add")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            type === "add"
              ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
              : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          Add Tax (Tax Exclusive)
        </button>
        <button
          onClick={() => setType("remove")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            type === "remove"
              ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
              : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          Remove Tax (Tax Inclusive)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              Amount ({currency})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              Tax Percentage (%)
            </label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 text-white space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
              Tax Summary
            </span>
            <button
              onClick={() =>
                onCopy(
                  `Net: ${currency}${taxData.base.toFixed(2)} | Tax: ${currency}${taxData.tax.toFixed(2)} | Total: ${currency}${taxData.total.toFixed(2)}`
                )
              }
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div>
            <span className="text-xs text-slate-300 block">Gross Total Amount</span>
            <div className="text-3xl font-extrabold text-white">
              {currency}
              {taxData.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-3">
            <div>
              <span className="text-slate-400 block">Net Base Amount</span>
              <span className="font-semibold text-white">{currency}{taxData.base.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Tax Amount ({taxRate}%)</span>
              <span className="font-semibold text-emerald-400">+{currency}{taxData.tax.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 8. EMI / Loan Calculator
function EmiLoanCalculatorSub({
  currency,
  onCopy,
  copied,
}: {
  currency: string;
  onCopy: (txt: string) => void;
  copied: boolean;
}) {
  const [loanAmount, setLoanAmount] = useState<number>(250000);
  const [interestRate, setInterestRate] = useState<number>(7.5);
  const [tenureYears, setTenureYears] = useState<number>(15);

  const emiData = useMemo(() => {
    const p = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;

    if (r === 0) {
      const emi = p / n;
      return { emi, totalPayment: p, totalInterest: 0, n };
    }

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;

    return { emi, totalPayment, totalInterest, n };
  }, [loanAmount, interestRate, tenureYears]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-500" /> EMI & Loan Calculator
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate equal monthly loan installments and total interest overhead.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              <span>Loan Amount ({currency})</span>
              <span className="font-bold text-slate-900 dark:text-white">{currency}{loanAmount.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={10000}
              max={1000000}
              step={5000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              <span>Annual Interest Rate (%)</span>
              <span className="font-bold text-slate-900 dark:text-white">{interestRate}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              <span>Tenure (Years)</span>
              <span className="font-bold text-slate-900 dark:text-white">{tenureYears} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
              Loan Repayment Breakdown
            </span>
            <button
              onClick={() =>
                onCopy(
                  `Monthly EMI: ${currency}${emiData.emi.toFixed(2)} | Total Interest: ${currency}${emiData.totalInterest.toFixed(2)}`
                )
              }
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div>
            <span className="text-xs text-slate-300 block">Monthly EMI Payment</span>
            <div className="text-3xl font-extrabold text-emerald-400">
              {currency}
              {emiData.emi.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-3">
            <div>
              <span className="text-slate-400 block">Principal Amount</span>
              <span className="font-semibold text-white">{currency}{loanAmount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Total Interest</span>
              <span className="font-semibold text-amber-400">{currency}{emiData.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 9. Salary Calculator
function SalaryCalculatorSub({
  currency,
  onCopy,
  copied,
}: {
  currency: string;
  onCopy: (txt: string) => void;
  copied: boolean;
}) {
  const [wageMode, setWageMode] = useState<"hourly" | "annual">("hourly");
  const [amount, setAmount] = useState<number>(45);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [taxBracket, setTaxBracket] = useState<number>(20);

  const salaryData = useMemo(() => {
    let annualGross = 0;
    if (wageMode === "hourly") {
      annualGross = amount * hoursPerWeek * 52;
    } else {
      annualGross = amount;
    }

    const monthlyGross = annualGross / 12;
    const biweeklyGross = annualGross / 26;
    const weeklyGross = annualGross / 52;

    const annualTax = (taxBracket / 100) * annualGross;
    const annualNet = annualGross - annualTax;
    const monthlyNet = annualNet / 12;

    return { annualGross, monthlyGross, biweeklyGross, weeklyGross, annualNet, monthlyNet };
  }, [wageMode, amount, hoursPerWeek, taxBracket]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-500" /> Salary & Hourly Wage Converter
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Convert hourly wages to annual pay and calculate net take-home salary.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setWageMode("hourly");
            setAmount(45);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            wageMode === "hourly"
              ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
              : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          Hourly Wage
        </button>
        <button
          onClick={() => {
            setWageMode("annual");
            setAmount(90000);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            wageMode === "annual"
              ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
              : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          Annual Salary
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              {wageMode === "hourly" ? `Hourly Wage Rate (${currency})` : `Annual Gross Salary (${currency})`}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              Hours Per Week
            </label>
            <input
              type="number"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              Estimated Tax Deduction (%)
            </label>
            <input
              type="number"
              value={taxBracket}
              onChange={(e) => setTaxBracket(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 text-white space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
              Compensation Summary
            </span>
            <button
              onClick={() =>
                onCopy(
                  `Annual Gross: ${currency}${salaryData.annualGross.toFixed(2)} | Net Monthly: ${currency}${salaryData.monthlyNet.toFixed(2)}`
                )
              }
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div>
            <span className="text-xs text-slate-300 block">Annual Gross Salary</span>
            <div className="text-3xl font-extrabold text-white">
              {currency}
              {salaryData.annualGross.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-3">
            <div>
              <span className="text-slate-400 block">Monthly Net Take-Home</span>
              <span className="font-semibold text-emerald-400">{currency}{salaryData.monthlyNet.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Bi-Weekly Gross</span>
              <span className="font-semibold text-white">{currency}{salaryData.biweeklyGross.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 10. Compound Interest Calculator
function CompoundInterestCalculatorSub({
  currency,
  onCopy,
  copied,
}: {
  currency: string;
  onCopy: (txt: string) => void;
  copied: boolean;
}) {
  const [initialDeposit, setInitialDeposit] = useState<number>(5000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(300);
  const [interestRate, setInterestRate] = useState<number>(8);
  const [years, setYears] = useState<number>(10);

  const compoundData = useMemo(() => {
    let total = initialDeposit;
    let totalDeposited = initialDeposit;

    for (let month = 1; month <= years * 12; month++) {
      total += monthlyContribution;
      totalDeposited += monthlyContribution;
      total += total * (interestRate / 100 / 12);
    }

    const interestEarned = total - totalDeposited;
    return { finalBalance: total, totalDeposited, interestEarned };
  }, [initialDeposit, monthlyContribution, interestRate, years]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" /> Compound Interest & Wealth Forecast
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Simulate future wealth accumulation with compounding returns and recurring contributions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              Initial Principal ({currency})
            </label>
            <input
              type="number"
              value={initialDeposit}
              onChange={(e) => setInitialDeposit(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              Monthly Contribution ({currency})
            </label>
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Annual Return (%)
              </label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Horizon (Years)
              </label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
              Future Wealth Value ({years} Yrs)
            </span>
            <button
              onClick={() =>
                onCopy(
                  `Future Balance: ${currency}${compoundData.finalBalance.toFixed(2)} | Interest Earned: ${currency}${compoundData.interestEarned.toFixed(2)}`
                )
              }
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {currency}
              {compoundData.finalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-blue-200 mt-1">
              Interest Growth: +{currency}{compoundData.interestEarned.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-3">
            <div>
              <span className="text-slate-400 block">Total Principal Invested</span>
              <span className="font-semibold text-white">{currency}{compoundData.totalDeposited.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Compounding Growth Ratio</span>
              <span className="font-semibold text-emerald-400">
                {((compoundData.interestEarned / compoundData.totalDeposited) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
