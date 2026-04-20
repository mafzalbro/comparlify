"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function revalidateCacheAction(path: "all" | "blog" | "compare" | "news" | "community" | "tools") {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  try {
    if (path === "all") {
      revalidatePath("/", "layout");
    } else {
      revalidatePath(`/${path}`, "layout");
      // Also revalidate homepage since it has sections for these
      revalidatePath("/");
    }
    return { success: `Successfully revalidated ${path} signals.` };
  } catch (error) {
    console.error("Revalidation error:", error);
    return { error: `Failed to revalidate ${path} cache.` };
  }
}
