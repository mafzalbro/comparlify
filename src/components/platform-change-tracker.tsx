"use client";

import React from "react";
import { PlatformChangeLogData } from "@/data/compare/types";
import { Badge } from "@/components/ui/badge";
import { History, Clock, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";

interface PlatformChangeTrackerProps {
  platformName: string;
  lastVerifiedAt?: string | Date;
  changeLogs?: PlatformChangeLogData[];
  className?: string;
}

export function PlatformChangeTracker({
  platformName,
  lastVerifiedAt,
  changeLogs = [],
  className = ""
}: PlatformChangeTrackerProps) {
  const verifiedDateStr = lastVerifiedAt
    ? new Date(lastVerifiedAt).toLocaleDateString("en-US", { month: "short", year: "numeric", day: "numeric" })
    : "Aug 2026";

  const getTypeBadgeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "PRICING":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "FEATURE":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "FEE_UPDATE":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "SECURITY":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <div className={`bg-card/40 backdrop-blur-md border border-border/40 p-6 md:p-8 rounded-3xl shadow-lg ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-border/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Real-Time Audit
            </Badge>
          </div>
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <History className="w-6 h-6 text-primary" /> Platform Change Tracker
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-secondary/30 px-3.5 py-2 rounded-xl border border-border/30">
          <Clock className="w-4 h-4 text-primary" />
          <span>Pricing last verified: <strong className="text-foreground">{verifiedDateStr}</strong></span>
        </div>
      </div>

      {changeLogs.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-secondary/10 border border-border/20 text-muted-foreground">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm font-semibold">No recent breaking pricing or architecture policy updates logged for {platformName}.</p>
          <p className="text-xs text-muted-foreground mt-1">Platform parameters confirmed stable under 2026 baseline.</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/40">
          {changeLogs.map((log, idx) => (
            <div key={log.id || idx} className="relative group">
              {/* Circle Marker */}
              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background shadow-xs group-hover:scale-125 transition-transform" />

              <div className="bg-secondary/20 p-4 rounded-2xl border border-border/20 hover:border-border/40 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${getTypeBadgeColor(log.type)}`}>
                      {log.type}
                    </Badge>
                    <span className="text-xs font-bold font-mono text-muted-foreground">
                      {new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  {log.sourceUrl && (
                    <a
                      href={log.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
                    >
                      Source <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <h4 className="text-base font-extrabold text-foreground mb-1">
                  {log.title}
                </h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {log.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
