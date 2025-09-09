
"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// --- Cache Management Action ---
export async function revalidateCacheAction(path: 'all' | 'blog' | 'compare') {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { error: "Not authorized" };
    }
    
    try {
        if (path === 'all') {
            revalidatePath('/', 'layout');
        } else {
            revalidatePath(`/${path}`, 'layout');
        }
        return { success: `Successfully revalidated ${path} pages.` };
    } catch (error) {
        console.error("Revalidation error:", error);
        return { error: `Failed to revalidate ${path} pages.` };
    }
}
