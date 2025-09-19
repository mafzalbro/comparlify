"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface UpdateContentState {
  error: string | null;
  success: boolean;
}

export async function updateContentAction(
  prevState: UpdateContentState,
  formData: FormData
): Promise<UpdateContentState> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Not authorized", success: false };
  }

  const updates = Array.from(formData.entries());

  const keys = updates.map(([key, _]) => key);

  const existing = await prisma.siteContent.findMany({
    where: { key: { in: keys } },
    select: { key: true },
  });
  const existingKeys = new Set(existing.map((r) => r.key));

  const missingKeys = keys.filter((k) => !existingKeys.has(k));

  if (missingKeys.length > 0) {
    return {
      error: `Missing keys: ${missingKeys.join(", ")}`,
      success: false,
    };
  }

  try {
    await prisma.$transaction(
      updates.map(([key, value]) =>
        prisma.siteContent.update({
          where: { key },
          data: { value: value as string },
        })
      )
    );

    revalidatePath("/", "layout"); // Revalidate all pages
    return { error: null, success: true };
  } catch (error) {
    console.error("Failed to update site content:", error);
    return { error: "Failed to update content.", success: false };
  }
}
