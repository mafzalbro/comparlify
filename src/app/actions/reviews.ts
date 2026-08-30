"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface SubmitReviewInput {
  creatorName?: string;
  creatorEmail?: string;
  creatorSegment: string;
  audienceRange: string;
  usageDurationMonths: number;
  spendRange: string;
  currentPlatformId: string;
  previousPlatformId?: string;
  selectionReason: string;
  bottleneck: string;
  recommendationScore: number;
}

export async function submitCreatorReviewAction(input: SubmitReviewInput) {
  if (!input.currentPlatformId || !input.selectionReason || !input.recommendationScore) {
    return { success: false, error: "Missing required review parameters." };
  }

  try {
    const review = await prisma.creatorReview.create({
      data: {
        creatorName: input.creatorName || "Anonymous Creator",
        creatorEmail: input.creatorEmail,
        creatorSegment: input.creatorSegment,
        audienceRange: input.audienceRange,
        usageDurationMonths: Number(input.usageDurationMonths),
        spendRange: input.spendRange,
        currentPlatformId: input.currentPlatformId,
        previousPlatformId: input.previousPlatformId || null,
        selectionReason: input.selectionReason,
        bottleneck: input.bottleneck,
        recommendationScore: Number(input.recommendationScore),
        status: "PENDING",
        verificationStatus: "COMMUNITY",
        revisions: {
          create: {
            revisionNumber: 1,
            recommendationScore: Number(input.recommendationScore),
            selectionReason: input.selectionReason,
            bottleneck: input.bottleneck,
          },
        },
        moderationEvents: {
          create: {
            action: "SUBMITTED",
            notes: "Review submitted by user; queued for admin moderation.",
          },
        },
      },
    });

    revalidatePath("/admin/reviews");
    return { success: true, reviewId: review.id };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit review." };
  }
}

export async function approveReviewAction(reviewId: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Unauthorized: Admin access required." };
  }

  const adminEmail = session.user.email || "admin@comparlify.com";

  try {
    const review = await prisma.creatorReview.update({
      where: { id: reviewId },
      data: {
        status: "PUBLISHED",
        moderationEvents: {
          create: {
            action: "APPROVED",
            actor: adminEmail,
            notes: "Review approved and published.",
          },
        },
      },
    });

    revalidatePath("/admin/reviews");
    revalidatePath("/platform");
    return { success: true, review };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to approve review." };
  }
}

export async function rejectReviewAction(reviewId: string, notes?: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Unauthorized: Admin access required." };
  }

  const adminEmail = session.user.email || "admin@comparlify.com";

  try {
    const review = await prisma.creatorReview.update({
      where: { id: reviewId },
      data: {
        status: "REJECTED",
        moderationEvents: {
          create: {
            action: "REJECTED",
            actor: adminEmail,
            notes: notes || "Review rejected during moderation.",
          },
        },
      },
    });

    revalidatePath("/admin/reviews");
    return { success: true, review };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to reject review." };
  }
}

export async function updateVerificationAction(
  reviewId: string,
  verificationStatus: "COMMUNITY" | "EXPERIENCED" | "VERIFIED"
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Unauthorized: Admin access required." };
  }

  const adminEmail = session.user.email || "admin@comparlify.com";

  try {
    const review = await prisma.creatorReview.update({
      where: { id: reviewId },
      data: {
        verificationStatus,
        moderationEvents: {
          create: {
            action: "VERIFICATION_CHANGED",
            actor: adminEmail,
            notes: `Verification status updated to ${verificationStatus}.`,
          },
        },
      },
    });

    revalidatePath("/admin/reviews");
    revalidatePath("/platform");
    return { success: true, review };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update verification status." };
  }
}
