"use client";

import React, { useState, useEffect } from "react";
import { Clock, RefreshCw, ArrowLeftRight } from "lucide-react";

export function UnixTimestampConverter() {
  const [timestamp, setTimestamp] = useState("");
  const [results, setResults] = useState<{
    local: string;
    gmt: string;
    iso: string;
  } | null>(null);

  // Date to Timestamp state
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [day, setDay] = useState(new Date().getDate().toString());
  const [hours, setHours] = useState(new Date().getHours().toString());
  const [minutes, setMinutes] = useState(new Date().getMinutes().toString());
  const [seconds, setSeconds] = useState(new Date().getSeconds().toString());
  const [calculatedTimestamp, setCalculatedTimestamp] = useState<number | null>(null);

  // Set current time as initial timestamp on mount
  useEffect(() => {
    const now = Math.floor(Date.now() / 1000).toString();
    setTimestamp(now);
    handleConvert(now);
  }, []);

  const handleConvert = (inputVal?: string) => {
    const val = inputVal !== undefined ? inputVal : timestamp;
    if (!val) {
      setResults(null);
      return;
    }

    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      setResults(null);
      return;
    }

    // Detect milliseconds vs seconds
    const isMs = val.length >= 13;
    const date = new Date(isMs ? parsed : parsed * 1000);

    if (isNaN(date.getTime())) {
      setResults(null);
      return;
    }

    setResults({
      local: date.toLocaleString(),
      gmt: date.toUTCString(),
      iso: date.toISOString(),
    });
  };

  const handleCalculateTimestamp = () => {
    const date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hours, 10),
      parseInt(minutes, 10),
      parseInt(seconds, 10)
    );

    if (isNaN(date.getTime())) {
      setCalculatedTimestamp(null);
      return;
    }

    setCalculatedTimestamp(Math.floor(date.getTime() / 1000));
  };

  const handleSetCurrent = () => {
    const now = Math.floor(Date.now() / 1000).toString();
    setTimestamp(now);
    handleConvert(now);
  };

  return (
    <div className="space-y-8">
      {/* ── Timestamp to Date ───────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" /> Convert Unix Timestamp to Date
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2 flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Unix Timestamp</span>
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="e.g. 1710000000"
              className="w-full p-2.5 rounded-xl border border-border/30 bg-secondary/20 font-mono text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          <button
            onClick={() => handleConvert()}
            className="py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Convert
          </button>
          <button
            onClick={handleSetCurrent}
            className="py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/40 text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Current Time
          </button>
        </div>

        {results && (
          <div className="p-5 rounded-2xl border border-border/10 bg-secondary/30 space-y-3 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground block uppercase mb-1">Local Time</span>
                <span className="text-foreground font-bold">{results.local}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground block uppercase mb-1">GMT / UTC</span>
                <span className="text-foreground font-bold">{results.gmt}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground block uppercase mb-1">ISO 8601</span>
                <span className="text-primary font-bold">{results.iso}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Date to Timestamp ───────────────────────────────────────── */}
      <div className="space-y-4 pt-6 border-t border-border/10">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-primary" /> Convert Calendar Date to Timestamp
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground">Year</span>
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="p-2 bg-secondary/30 border border-border/30 rounded-lg text-xs text-center font-mono" />
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground">Month</span>
            <input type="number" value={month} onChange={(e) => setMonth(e.target.value)} className="p-2 bg-secondary/30 border border-border/30 rounded-lg text-xs text-center font-mono" />
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground">Day</span>
            <input type="number" value={day} onChange={(e) => setDay(e.target.value)} className="p-2 bg-secondary/30 border border-border/30 rounded-lg text-xs text-center font-mono" />
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground">Hour</span>
            <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className="p-2 bg-secondary/30 border border-border/30 rounded-lg text-xs text-center font-mono" />
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground">Minute</span>
            <input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} className="p-2 bg-secondary/30 border border-border/30 rounded-lg text-xs text-center font-mono" />
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground">Second</span>
            <input type="number" value={seconds} onChange={(e) => setSeconds(e.target.value)} className="p-2 bg-secondary/30 border border-border/30 rounded-lg text-xs text-center font-mono" />
          </div>
          <button
            onClick={handleCalculateTimestamp}
            className="py-2 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold h-9 mt-5"
          >
            Calculate
          </button>
        </div>

        {calculatedTimestamp !== null && (
          <div className="p-4 rounded-xl border border-border/10 bg-secondary/30 font-mono text-xs flex justify-between items-center">
            <div>
              <span className="text-muted-foreground">Unix Timestamp (seconds): </span>
              <strong className="text-primary text-sm font-bold ml-1">{calculatedTimestamp}</strong>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(calculatedTimestamp.toString());
              }}
              className="text-[10px] text-primary hover:underline font-bold uppercase"
            >
              Copy Timestamp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
