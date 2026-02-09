"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { ActionState } from "@/types/actions";
import { ToolCategory } from "@prisma/client";

const toolSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  category: z.nativeEnum(ToolCategory),
  Icon: z.string().min(1),
  prompt: z.string().min(10),
  inputTopicLabel: z.string().optional(),
  inputContextLabel: z.string().optional(),
  enabled: z.preprocess((val) => val === "on", z.boolean()),
});

export async function createTool(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const data = Object.fromEntries(formData.entries());
  const validatedFields = toolSchema.safeParse(data);

  if (!validatedFields.success) {
    console.error(validatedFields.error);
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await prisma.tool.create({
      data: validatedFields.data,
    });
    revalidatePath("/admin/tools");
    revalidatePath("/tools");
  } catch (error) {
    console.error(error);
    if (error && typeof error === "object" && "code" in error) {
      if ((error as any).code === "P2002") {
        return {
          error: {
            slug: ["This slug is already in use. Please choose a unique one."],
          },
        };
      }
    }
    return { error: "Failed to create tool." };
  }

  redirect("/admin/tools");
}

export async function updateTool(
  id: string,
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const data = Object.fromEntries(formData.entries());
  const validatedFields = toolSchema.safeParse(data);

  if (!validatedFields.success) {
    console.error(validatedFields.error);
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await prisma.tool.update({
      where: { id },
      data: validatedFields.data,
    });
    revalidatePath("/admin/tools");
    revalidatePath(`/tools`);
  } catch (error) {
    console.error(error);
    if (error && typeof error === "object" && "code" in error) {
      if ((error as any).code === "P2002") {
        return {
          error: {
            slug: ["This slug is already in use. Please choose a unique one."],
          },
        };
      }
    }
    return { error: "Failed to update tool." };
  }

  redirect("/admin/tools");
}

export async function deleteTool(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  const id = formData.get("id") as string;
  if (!id) {
    return { error: "Tool ID is missing." };
  }
  try {
    await prisma.tool.delete({ where: { id } });
    revalidatePath("/admin/tools");
    revalidatePath("/tools");
    return { error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete tool." };
  }
}

export async function updateToolStatus(toolId: string, enabled: boolean) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Not authorized" };
  }
  try {
    await prisma.tool.update({
      where: { id: toolId },
      data: { enabled },
    });
    revalidatePath("/admin/tools");
    revalidatePath("/tools");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update tool status." };
  }
}
