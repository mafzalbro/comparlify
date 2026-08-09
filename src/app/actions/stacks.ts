"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { ActionState } from "@/types/actions";

const stackSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  platforms: z.array(z.object({
    platformId: z.string(),
    role: z.string()
  })).min(1),
  verificationUrl: z.string().url().optional().or(z.literal("")),
});

export async function createUserStack(
  prevState: ActionState,
  data: z.infer<typeof stackSchema>
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to share a stack." };
  }

  try {
    await prisma.$transaction(async (tx: any) => {
      const stack = await tx.userStack.create({
        data: {
          title: data.title,
          description: data.description,
          userId: session.user.id,
          verificationUrl: data.verificationUrl || null,
          isVerified: false, // Must be reviewed by admin or verified via automation
        },
      });

      const stackPlatforms = data.platforms.map((p) => ({
        stackId: stack.id,
        platformId: p.platformId,
        role: p.role,
      }));

      await tx.stackPlatform.createMany({
        data: stackPlatforms,
      });
    });

    revalidatePath("/community/verified-stacks");
    return { success: true, message: "Stack shared successfully! It will appear after a brief verification review." };
  } catch (error) {
    console.error("Stack creation error:", error);
    return { error: "Failed to share stack infrastructure." };
  }
}

export async function getVerifiedStacks() {
  return prisma.userStack.findMany({
    where: {
      isVerified: true
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          role: true
        }
      },
      platforms: {
        include: {
          platform: {
            select: {
              name: true,
              logoUrl: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function toggleStackVerification(stackId: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const stack = await prisma.userStack.findUnique({ where: { id: stackId } });
    if (!stack) throw new Error("Stack not found");

    await prisma.userStack.update({
        where: { id: stackId },
        data: { isVerified: !stack.isVerified }
    });

    revalidatePath("/community/verified-stacks");
}
