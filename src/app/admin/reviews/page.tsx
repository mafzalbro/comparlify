import React from "react";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ShieldCheck, Clock, MessageSquare, AlertCircle, Sparkles } from "lucide-react";
import { approveReviewAction, rejectReviewAction, updateVerificationAction } from "@/app/actions/reviews";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "Creator Review Moderation Queue - Comparlify Admin",
    description: "Internal review moderation command center for approving, verifying, and moderating submitted creator reviews.",
    path: "/admin/reviews",
  });
}

export default async function AdminReviewsModerationPage() {
  const reviews = await prisma.creatorReview.findMany({
    include: {
      currentPlatform: true,
      previousPlatform: true,
      moderationEvents: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingReviews = reviews.filter((r: any) => r.status === "PENDING");
  const publishedReviews = reviews.filter((r: any) => r.status === "PUBLISHED");
  const rejectedReviews = reviews.filter((r: any) => r.status === "REJECTED");

  return (
    <div className="bg-background min-h-screen pb-32">
      {/* HERO */}
      <section className="relative pt-16 pb-12 overflow-hidden border-b border-border/20">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 uppercase tracking-widest text-[10px] font-black rounded-full mb-4">
            Internal Data Quality Center
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-tight">
            Creator Review <span className="text-primary italic">Moderation Queue</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-xl mx-auto">
            Audit, verify, and moderate submitted creator experience reviews before publishing to public platform scorecards.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 max-w-7xl pt-12 space-y-12">
        {/* STATUS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-amber-500 text-xs font-bold uppercase tracking-wider">
              <span>Pending Moderation</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-amber-500">{pendingReviews.length}</div>
            <div className="text-[11px] text-muted-foreground font-medium">Reviews awaiting admin approval</div>
          </Card>

          <Card className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-emerald-500 text-xs font-bold uppercase tracking-wider">
              <span>Published Reviews</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-emerald-500">{publishedReviews.length}</div>
            <div className="text-[11px] text-muted-foreground font-medium">Contributing to public Creator Ratings</div>
          </Card>

          <Card className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-rose-500 text-xs font-bold uppercase tracking-wider">
              <span>Rejected / Archived</span>
              <XCircle className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-rose-500">{rejectedReviews.length}</div>
            <div className="text-[11px] text-muted-foreground font-medium">Excluded from aggregate ratings</div>
          </Card>
        </div>

        {/* REVIEWS QUEUE */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" /> Submitted Review Records ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <Card className="p-8 text-center bg-card/40 border border-border/40 rounded-3xl text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm font-semibold">No creator reviews logged in moderation database.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {reviews.map((rev: any) => (
                <Card key={rev.id} className="bg-card/40 backdrop-blur-md border border-border/40 p-6 rounded-3xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/20">
                    <div className="flex items-center gap-3">
                      <Badge className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                        rev.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        rev.status === "PENDING" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      }`}>
                        {rev.status}
                      </Badge>

                      <Badge variant="outline" className="text-[10px] uppercase font-bold px-2 py-0.5 border-border/40">
                        {rev.verificationStatus}
                      </Badge>

                      <span className="text-xs font-mono text-muted-foreground">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase text-muted-foreground">Recommendation Score</div>
                      <div className="text-lg font-black text-primary">{rev.recommendationScore} / 5.0</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium bg-secondary/10 p-4 rounded-2xl border border-border/10">
                    <div>
                      <span className="font-extrabold text-foreground block">Creator Context</span>
                      <p className="text-muted-foreground">{rev.creatorName} ({rev.creatorSegment})</p>
                      <p className="text-muted-foreground">Audience: {rev.audienceRange} | Spend: {rev.spendRange}</p>
                    </div>

                    <div>
                      <span className="font-extrabold text-foreground block">Platforms</span>
                      <p className="text-muted-foreground">Current: <strong>{rev.currentPlatform?.name}</strong> ({rev.usageDurationMonths} mo)</p>
                      <p className="text-muted-foreground">Previous: <strong>{rev.previousPlatform?.name || "None"}</strong></p>
                    </div>

                    <div>
                      <span className="font-extrabold text-foreground block">Selection Reason & Bottleneck</span>
                      <p className="text-muted-foreground line-clamp-1">Reason: "{rev.selectionReason}"</p>
                      <p className="text-muted-foreground line-clamp-1">Bottleneck: "{rev.bottleneck}"</p>
                    </div>
                  </div>

                  {/* MODERATION ACTIONS */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <form action={async () => {
                      "use server";
                      await updateVerificationAction(rev.id, rev.verificationStatus === "VERIFIED" ? "COMMUNITY" : "VERIFIED");
                    }}>
                      <Button type="submit" variant="outline" size="sm" className="rounded-xl text-xs font-bold border-border/40">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                        Toggle Verification ({rev.verificationStatus})
                      </Button>
                    </form>

                    <div className="flex gap-3">
                      {rev.status !== "REJECTED" && (
                        <form action={async () => {
                          "use server";
                          await rejectReviewAction(rev.id);
                        }}>
                          <Button type="submit" variant="ghost" size="sm" className="rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10">
                            Reject Review
                          </Button>
                        </form>
                      )}

                      {rev.status !== "PUBLISHED" && (
                        <form action={async () => {
                          "use server";
                          await approveReviewAction(rev.id);
                        }}>
                          <Button type="submit" size="sm" className="rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve & Publish Review
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
