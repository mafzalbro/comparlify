"use client";

import React, { useState, useEffect } from "react";
import { Check, Copy, RefreshCw, Calendar, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CronGenerator() {
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");

  const [cronExpression, setCronExpression] = useState("* * * * *");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Decoding state
  const [decodeInput, setDecodeInput] = useState("0 12 * * 1-5");
  const [decodedText, setDecodedText] = useState("");

  const handleGenerate = () => {
    const expr = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    setCronExpression(expr);
  };

  useEffect(() => {
    handleGenerate();
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  // Decodes a standard 5-part cron string into human English
  const decodeCron = (expr: string) => {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) {
      return "Invalid cron format. Standard cron must have exactly 5 fields.";
    }

    const [min, hr, dom, mon, dow] = parts;

    let timeDesc = "";
    if (min === "*" && hr === "*") {
      timeDesc = "every minute of every hour";
    } else if (min !== "*" && hr === "*") {
      timeDesc = `at minute ${min} of every hour`;
    } else if (min === "*" && hr !== "*") {
      timeDesc = `every minute of hour ${hr}`;
    } else {
      timeDesc = `at ${hr.padStart(2, "0")}:${min.padStart(2, "0")}`;
    }

    let domDesc = dom === "*" ? "every day of the month" : `on day ${dom} of the month`;
    let monDesc = mon === "*" ? "every month" : `in month ${mon}`;
    let dowDesc = "";

    if (dow === "*") {
      dowDesc = "every day of the week";
    } else {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      if (dow.includes("-")) {
        const [start, end] = dow.split("-").map(Number);
        if (!isNaN(start) && !isNaN(end) && days[start] && days[end]) {
          dowDesc = `from ${days[start]} through ${days[end]}`;
        } else {
          dowDesc = `on days of week ${dow}`;
        }
      } else {
        const dowNums = dow.split(",").map(Number);
        const dayNames = dowNums.map(n => days[n] || n).join(", ");
        dowDesc = `on ${dayNames}`;
      }
    }

    return `Runs ${timeDesc}, ${domDesc}, ${monDesc}, ${dowDesc}.`;
  };

  useEffect(() => {
    setDecodedText(decodeCron(decodeInput));
  }, [decodeInput]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cronExpression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Cron expression copied to clipboard.",
    });
  };

  return (
    <div className="space-y-8">
      {/* ── Generator ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" /> Build Cron Expression
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Minutes</span>
            <select value={minute} onChange={(e) => setMinute(e.target.value)} className="p-2.5 rounded-xl border border-border/30 bg-secondary/20 text-xs">
              <option value="*">Every minute (*)</option>
              <option value="0">At start of hour (0)</option>
              <option value="*/5">Every 5 minutes (*/5)</option>
              <option value="*/15">Every 15 minutes (*/15)</option>
              <option value="*/30">Every 30 minutes (*/30)</option>
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Hours</span>
            <select value={hour} onChange={(e) => setHour(e.target.value)} className="p-2.5 rounded-xl border border-border/30 bg-secondary/20 text-xs">
              <option value="*">Every hour (*)</option>
              <option value="0">Midnight (0)</option>
              <option value="12">Noon (12)</option>
              <option value="*/2">Every 2 hours (*/2)</option>
              <option value="*/6">Every 6 hours (*/6)</option>
              <option value="*/12">Every 12 hours (*/12)</option>
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Day of Month</span>
            <select value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} className="p-2.5 rounded-xl border border-border/30 bg-secondary/20 text-xs">
              <option value="*">Every day (*)</option>
              <option value="1">1st of Month (1)</option>
              <option value="15">15th of Month (15)</option>
              <option value="*/5">Every 5 days (*/5)</option>
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Month</span>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="p-2.5 rounded-xl border border-border/30 bg-secondary/20 text-xs">
              <option value="*">Every month (*)</option>
              <option value="1">January (1)</option>
              <option value="6">June (6)</option>
              <option value="12">December (12)</option>
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Day of Week</span>
            <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className="p-2.5 rounded-xl border border-border/30 bg-secondary/20 text-xs">
              <option value="*">Every day (*)</option>
              <option value="1-5">Monday - Friday (1-5)</option>
              <option value="0,6">Weekends (0,6)</option>
              <option value="1">Monday (1)</option>
            </select>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/10 bg-secondary/30 flex items-center justify-between font-mono text-xs">
          <div>
            <span className="text-muted-foreground">Cron String: </span>
            <strong className="text-primary text-sm ml-1.5">{cronExpression}</strong>
          </div>
          <button onClick={handleCopy} className="text-xs text-primary hover:underline font-bold flex items-center gap-1">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied!" : "Copy Expression"}
          </button>
        </div>
      </div>

      {/* ── Decoder ──────────────────────────────────────────────────── */}
      <div className="space-y-4 pt-6 border-t border-border/10">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" /> Decode Cron String to English
        </h3>
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Paste Cron String (5 Fields)</span>
          <input
            type="text"
            value={decodeInput}
            onChange={(e) => setDecodeInput(e.target.value)}
            placeholder="e.g. */15 9-17 * * 1-5"
            className="w-full p-2.5 rounded-xl border border-border/30 bg-secondary/20 font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        {decodedText && (
          <div className="p-4 rounded-xl border border-border/10 bg-primary/5 text-xs leading-relaxed font-semibold text-primary">
            {decodedText}
          </div>
        )}
      </div>
    </div>
  );
}
