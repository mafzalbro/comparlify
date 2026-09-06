"use client";

import React, { useState } from "react";
import { submitCreatorReviewAction } from "@/app/actions/reviews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Sparkles, CheckCircle2, Send, ShieldCheck } from "lucide-react";

interface ReviewAcquisitionWidgetProps {
  platformId: string;
  platformName: string;
  className?: string;
}

export function ReviewAcquisitionWidget({
  platformId,
  platformName,
  className = ""
}: ReviewAcquisitionWidgetProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creatorName, setCreatorName] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [creatorSegment, setCreatorSegment] = useState("Course Creator");
  const [audienceRange, setAudienceRange] = useState("1K-10K");
  const [spendRange, setSpendRange] = useState("$50-$200/mo");
  const [usageDurationMonths, setUsageDurationMonths] = useState(12);
  const [selectionReason, setSelectionReason] = useState("");
  const [bottleneck, setBottleneck] = useState("");
  const [recommendationScore, setRecommendationScore] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectionReason.trim() || !bottleneck.trim()) {
      setError("Please describe your primary selection reason and operational bottleneck.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await submitCreatorReviewAction({
      creatorName,
      creatorEmail,
      creatorSegment,
      audienceRange,
      spendRange,
      usageDurationMonths,
      currentPlatformId: platformId,
      selectionReason,
      bottleneck,
      recommendationScore,
      sourceType: "FIRST_PARTY"
    });

    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || "Failed to submit experience review.");
    }
  };

  if (submitted) {
    return (
      <Card className={`bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-3xl text-center space-y-4 ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-black text-foreground">Thank You for Contributing!</h3>
        <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto font-medium">
          Your review for <strong>{platformName}</strong> has been submitted to our moderation queue. Once verified by our admin team, it will help thousands of creators make confident software decisions.
        </p>
      </Card>
    );
  }

  return (
    <Card className={`bg-card/40 backdrop-blur-md border border-border/40 p-6 md:p-8 rounded-3xl space-y-6 shadow-xl ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/20">
        <div>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full mb-1">
            First-Party Creator Intelligence
          </Badge>
          <h3 className="text-xl md:text-2xl font-black text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Have You Used {platformName}?
          </h3>
          <p className="text-xs text-muted-foreground font-semibold mt-1">
            Share your structured experience in 60 seconds to help build Comparlify's proprietary creator benchmark dataset.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl shrink-0">
          <ShieldCheck className="w-4 h-4" /> 100% Verified Community Signal
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">
            {error}
          </div>
        )}

        {/* STEP 1: LOW FRICTION QUICK RATING & METRICS */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-extrabold text-foreground">Creator Segment</label>
                <Select value={creatorSegment} onValueChange={setCreatorSegment}>
                  <SelectTrigger className="rounded-xl h-10 text-xs bg-secondary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Course Creator">Course Creator</SelectItem>
                    <SelectItem value="Newsletter Writer">Newsletter Writer</SelectItem>
                    <SelectItem value="Community Builder">Community Builder</SelectItem>
                    <SelectItem value="Solopreneur">Lean Solopreneur</SelectItem>
                    <SelectItem value="Enterprise">Enterprise Studio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-foreground">Audience Size</label>
                <Select value={audienceRange} onValueChange={setAudienceRange}>
                  <SelectTrigger className="rounded-xl h-10 text-xs bg-secondary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1K">0 – 1K subscribers</SelectItem>
                    <SelectItem value="1K-10K">1K – 10K subscribers</SelectItem>
                    <SelectItem value="10K-50K">10K – 50K subscribers</SelectItem>
                    <SelectItem value="50K-100K">50K – 100K subscribers</SelectItem>
                    <SelectItem value="100K+">100K+ subscribers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-foreground">Monthly Spend</label>
                <Select value={spendRange} onValueChange={setSpendRange}>
                  <SelectTrigger className="rounded-xl h-10 text-xs bg-secondary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$0-$50/mo">$0 – $50 / mo</SelectItem>
                    <SelectItem value="$50-$200/mo">$50 – $200 / mo</SelectItem>
                    <SelectItem value="$200-$500/mo">$200 – $500 / mo</SelectItem>
                    <SelectItem value="$500+/mo">$500+ / mo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
              <div className="space-y-1">
                <label className="font-extrabold text-foreground block">Overall Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRecommendationScore(star)}
                      className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${
                        recommendationScore >= star ? "bg-primary text-primary-foreground shadow-xs" : "bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      {star}★
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-xl px-6 h-11 font-extrabold text-xs uppercase tracking-wider"
              >
                Next: Add Review Context →
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: DETAILED SELECTION REASON & BOTTLENECK */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-extrabold text-foreground">Your Name or Pseudonym</label>
                <Input
                  placeholder="e.g. Alex (Newsletter Founder)"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="rounded-xl h-10 text-xs bg-secondary/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-foreground">Email (For Verification Badge)</label>
                <Input
                  type="email"
                  placeholder="alex@creator.com"
                  value={creatorEmail}
                  onChange={(e) => setCreatorEmail(e.target.value)}
                  className="rounded-xl h-10 text-xs bg-secondary/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-foreground">Why did you choose {platformName}?</label>
              <Textarea
                rows={2}
                placeholder={`What made ${platformName} stand out? (e.g. 0% take fees, ease of use, custom design sovereignty)`}
                value={selectionReason}
                onChange={(e) => setSelectionReason(e.target.value)}
                className="rounded-xl text-xs bg-secondary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-foreground">What is your biggest bottleneck with {platformName}?</label>
              <Textarea
                rows={2}
                placeholder={`Where does ${platformName} fall short or feel friction? (e.g. video upload limits, automation rules)`}
                value={bottleneck}
                onChange={(e) => setBottleneck(e.target.value)}
                className="rounded-xl text-xs bg-secondary/20"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                ← Back to Step 1
              </button>

              <Button type="submit" disabled={loading} className="rounded-xl px-6 h-11 font-extrabold text-xs uppercase tracking-wider">
                {loading ? "Submitting..." : "Submit Experience Review"} <Send className="w-3.5 h-3.5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </form>
    </Card>
  );
}
