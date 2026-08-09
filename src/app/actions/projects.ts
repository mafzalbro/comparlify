"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { ActionState } from "@/types/actions";
import { calculatePlatformMatch, AuditDimensions as MatchDimensions } from "@/lib/match-engine";

const matchProfileSchema = z.object({
  name: z.string().min(3).max(100),
  revenue: z.number().min(0),
  studentCount: z.number().int().min(0),
  technicalSkill: z.number().int().min(1).max(5),
  requiredFeatures: z.array(z.string()),
  monthlyBudget: z.number().min(0),
});

export async function createProjectWithProfile(
  prevState: ActionState,
  data: z.infer<typeof matchProfileSchema>
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to create a project." };
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        userId: session.user.id,
        matchProfile: {
          create: {
            revenue: data.revenue,
            studentCount: data.studentCount,
            technicalSkill: data.technicalSkill,
            requiredFeatures: data.requiredFeatures,
            monthlyBudget: data.monthlyBudget,
          }
        }
      },
      include: {
        matchProfile: true
      }
    });

    revalidatePath("/dashboard/projects");
    return { 
        success: true, 
        message: "Project created! Calculating your optimal matches...",
        data: { projectId: project.id }
    };
  } catch (error) {
    console.error("Project creation error:", error);
    return { error: "Failed to create project workspace." };
  }
}

export async function getUserProjects() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return prisma.project.findMany({
        where: { userId: session.user.id },
        include: {
            matchProfile: true,
            savedStacks: {
                include: {
                    platforms: {
                        include: {
                            platform: true
                        }
                    }
                }
            }
        },
        orderBy: { updatedAt: "desc" }
    });
}

export async function getPlatformMatches(projectId: string) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { matchProfile: true }
    });

    if (!project || !project.matchProfile) return [];

    const platforms = await prisma.platform.findMany({
        include: {
            tiers: true,
            features: true
        }
    });

    const matchDimensions: MatchDimensions = {
        revenue: project.matchProfile.revenue,
        studentCount: project.matchProfile.studentCount,
        technicalSkill: project.matchProfile.technicalSkill as any,
        requiredFeatures: project.matchProfile.requiredFeatures as string[],
        monthlyBudget: project.matchProfile.monthlyBudget,
    };

    const scoredPlatforms = platforms.map((p: any) => {
        const score = calculatePlatformMatch(matchDimensions, p);
        return {
            ...score,
            platform: {
                name: p.name,
                logoUrl: p.logoUrl,
                description: p.description
            }
        };
    });

    return (scoredPlatforms as any[]).sort((a: any, b: any) => b.totalScore - a.totalScore);
}

export async function saveRoiSnapshot(
    projectId: string,
    snapshot: any
) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Login required" };

    try {
        await prisma.project.update({
            where: { id: projectId, userId: session.user.id },
            data: { roiSnapshots: snapshot }
        });
        revalidatePath(`/dashboard/projects/${projectId}`);
        revalidatePath("/tools/roi-calculator");
        return { success: true, message: "Calculation saved to project!" };
    } catch (error) {
        console.error("Save snapshot error:", error);
        return { error: "Failed to save calculation to project." };
    }
}

export async function assignStackToProject(
    stackId: string,
    projectId: string
) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Login required" };

    try {
        await prisma.userStack.update({
            where: { id: stackId, userId: session.user.id },
            data: { projectId }
        });
        revalidatePath(`/dashboard/projects/${projectId}`);
        revalidatePath("/tools/stack-architect");
        return { success: true, message: "Tech stack linked to project!" };
    } catch (error) {
        console.error("Assign stack error:", error);
        return { error: "Failed to link stack to project." };
    }
}

export async function getProject(projectId: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    return prisma.project.findUnique({
        where: { id: projectId, userId: session.user.id },
        include: {
            matchProfile: true,
            savedStacks: {
                include: {
                    platforms: {
                        include: {
                            platform: true
                        }
                    }
                }
            }
        }
    });
}

export async function createStackFromBlueprint(
    projectId: string,
    platforms: Array<{ platformId: string; role: string }>
) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        const result = await prisma.$transaction(async (tx: any) => {
            const project = await tx.project.findUnique({
                where: { id: projectId }
            });

            if (!project || project.userId !== session.user.id) {
                throw new Error("Project not found or unauthorized");
            }

            const stack = await tx.userStack.create({
                data: {
                    title: `${project.name} - Stack Blueprint`,
                    description: `Automatically generated architectural blueprint for ${project.name}.`,
                    userId: session.user.id,
                    projectId: projectId,
                }
            });

            await tx.stackPlatform.createMany({
                data: platforms.map(p => ({
                    stackId: stack.id,
                    platformId: p.platformId,
                    role: p.role
                }))
            });

            return stack;
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true, message: "Architectural blueprint synced to project.", data: result };
    } catch (error: any) {
        console.error("Blueprint sync error:", error);
        return { success: false, error: error.message || "Failed to sync blueprint." };
    }
}

export async function saveChurnSnapshot(
    projectId: string,
    data: {
        students: number;
        monthlyPrice: number;
        churnRate: number;
        improvementGoal: number;
        totalLostRevenue: number;
        salvagedRevenue: number;
    }
) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        const result = await prisma.project.update({
            where: { id: projectId, userId: session.user.id },
            data: {
                churnSnapshots: data as any
            }
        });

        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true, message: "Churn forecast recorded in workspace.", data: result };
    } catch (error: any) {
        console.error("Churn save error:", error);
        return { success: false, error: error.message || "Failed to save churn forecast." };
    }
}

export async function saveAdSnapshot(
    projectId: string,
    data: {
        adSpend: number;
        cpc: number;
        conversionRate: number;
        productPrice: number;
        totalProfit: number;
        roas: number;
    }
) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        const result = await prisma.project.update({
            where: { id: projectId, userId: session.user.id },
            data: {
                adSnapshots: data as any
            }
        });

        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true, message: "Ad forecast recorded in workspace.", data: result };
    } catch (error: any) {
        console.error("Ad save error:", error);
        return { success: false, error: error.message || "Failed to save ad forecast." };
    }
}

export async function getMatchFeatures() {
    const features = await prisma.feature.findMany({
        take: 12,
        orderBy: { platforms: { _count: 'desc' } }
    });
    return features.map((f: any) => ({
        id: f.id,
        name: f.name,
        icon: "✨"
    }));
}
