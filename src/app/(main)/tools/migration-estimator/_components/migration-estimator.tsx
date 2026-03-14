"use client";

import React, { useState, useMemo } from "react";
import { MotionDiv } from "@/components/motion-wrapper";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  History,
  Clock,
  Construction,
  AlertCircle,
  FileVideo,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  HardDrive,
  Sparkles,
} from "lucide-react";

const PLATFORM_COMPLEXITY: Record<string, number> = {
  Kajabi: 0.8, // Better export tools
  Teachable: 1.2, // Harder to get data out
  Thinkific: 1.0,
  Podia: 0.9,
  "Custom/Other": 1.5,
};

export function MigrationEstimator() {
  const [courses, setCourses] = useState(3);
  const [lessons, setLessons] = useState(50);
  const [videos, setVideos] = useState(10);
  const [fromPlatform, setFromPlatform] = useState("Kajabi");

  const estimates = useMemo(() => {
    const complexityMultiplier = PLATFORM_COMPLEXITY[fromPlatform] || 1.0;

    // Logic: 2 hours per course structure + 0.5 hours per lesson + 0.2 hours per video upload
    const baseHours = courses * 2 + lessons * 0.5 + videos * 0.2;
    const totalHours = Math.round(baseHours * complexityMultiplier);

    // Cost if hiring a specialist (avg $50/hr)
    const hiredCost = totalHours * 50;

    // Risk Level
    let risk = "Low";
    if (totalHours > 40) risk = "Medium";
    if (totalHours > 100 || complexityMultiplier > 1.3) risk = "High";

    return { totalHours, hiredCost, risk };
  }, [courses, lessons, videos, fromPlatform]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Configuration */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="p-8 bg-card/40 backdrop-blur-3xl border border-border/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 block flex items-center gap-2">
                <BookOpen className="h-3 w-3 text-primary" /> Total Courses
              </label>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-black tracking-tight text-foreground">
                  {courses}
                </span>
              </div>
              <Slider
                value={[courses]}
                onValueChange={(val) => setCourses(val[0])}
                max={20}
                step={1}
                className="py-4"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 block flex items-center gap-2">
                <Construction className="h-3 w-3 text-primary" /> Total Lessons
              </label>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-black tracking-tight text-foreground">
                  {lessons}
                </span>
              </div>
              <Slider
                value={[lessons]}
                onValueChange={(val) => setLessons(val[0])}
                max={500}
                step={5}
                className="py-4"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 block flex items-center gap-2">
                <FileVideo className="h-3 w-3 text-primary" /> Video Assets (GB)
              </label>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-black tracking-tight text-foreground">
                  {videos}
                </span>
              </div>
              <Slider
                value={[videos]}
                onValueChange={(val) => setVideos(val[0])}
                max={200}
                step={5}
                className="py-4"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 block flex items-center gap-2">
                <History className="h-3 w-3 text-primary" /> Moving From
              </label>
              <select
                value={fromPlatform}
                onChange={(e) => setFromPlatform(e.target.value)}
                className="w-full bg-background/50 border border-border/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
              >
                {Object.keys(PLATFORM_COMPLEXITY).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Right: Results */}
      <div className="lg:col-span-7 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          <Card className="p-8 bg-primary/10 border border-primary/20 rounded-[2.5rem] flex flex-col justify-between">
            <div>
              <Clock className="h-10 w-10 text-primary mb-6" />
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">
                Manual Labor Estimate
              </h4>
              <div className="text-5xl font-black tracking-tighter text-foreground mb-2">
                {estimates.totalHours}{" "}
                <span className="text-xl opacity-50">hrs</span>
              </div>
              <p className="text-sm font-bold opacity-70 leading-relaxed">
                Time required for structure rebuild, content copy, and file
                re-uploads.
              </p>
            </div>
            <div className="mt-8 pt-8 border-t border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest opacity-60">
                  Timeline
                </span>
                <span className="text-sm font-bold">
                  {Math.ceil(estimates.totalHours / 6)} Days
                </span>
              </div>
            </div>
          </Card>

          <div className="space-y-6 flex flex-col">
            <Card className="p-8 bg-card/40 backdrop-blur-3xl border border-border/10 rounded-[2.5rem] flex-1">
              <Construction className="h-6 w-6 text-muted-foreground mb-4" />
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">
                Specialist Hiring Cost
              </h4>
              <div className="text-3xl font-black tracking-tight text-foreground">
                ${estimates.hiredCost.toLocaleString()}
              </div>
              <p className="text-xs font-bold opacity-50 mt-2 italic">
                Based on median migration rates.
              </p>
            </Card>

            <Card
              className={`p-8 border rounded-[2.5rem] flex-1 ${estimates.risk === "High" ? "bg-destructive/10 border-destructive/20" : "bg-green-500/10 border-green-500/20"}`}
            >
              <ShieldAlert
                className={`h-6 w-6 mb-4 ${estimates.risk === "High" ? "text-destructive" : "text-green-500"}`}
              />
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">
                Data Loss Risk
              </h4>
              <div
                className={`text-3xl font-black tracking-tight ${estimates.risk === "High" ? "text-destructive" : "text-green-500"}`}
              >
                {estimates.risk}
              </div>
              <p className="text-xs font-bold opacity-50 mt-2">
                {estimates.risk === "High"
                  ? "Complex data structure detected. Manual audit required."
                  : "Standard export patterns detected. Clean migration expected."}
              </p>
            </Card>
          </div>
        </div>

        <Card className="p-8 bg-card/40 backdrop-blur-3xl border border-border/10 rounded-[2.5rem] relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  Pro Recommendation
                </span>
              </div>
              <h3 className="text-2xl font-black tracking-tight max-w-md">
                Don't start your migration without a{" "}
                <span className="text-primary italic">Success Blueprint.</span>
              </h3>
              <p className="text-sm font-bold text-muted-foreground max-w-sm">
                We've partnered with the top 3 platforms to provide White-Glove
                migration for free if you switch today.
              </p>
            </div>
            <button className="px-10 py-5 rounded-full bg-foreground text-background font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-2 group">
              Claim Free Migration{" "}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <HardDrive className="h-32 w-32" />
          </div>
        </Card>
      </div>
    </div>
  );
}
