
"use server";

import { seed as performSeed, cleanupDatabase as performCleanup } from "@/prisma/seed";
import { auth } from "@/lib/auth";

export async function seedDatabaseAction(): Promise<{ success?: string; error?: string }> {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { error: "Not authorized" };
    }
    
    try {
        await performSeed(true); // pass true to skip cleanup as it's done separately
        return { success: "Database has been successfully seeded." };
    } catch(e) {
        console.error(e);
        return { error: "An error occurred while seeding the database." };
    }
}

export async function cleanupDatabaseAction(): Promise<{ success?: string; error?: string }> {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { error: "Not authorized" };
    }

    try {
        await performCleanup();
        return { success: "Database has been successfully cleaned up." };
    } catch(e) {
        console.error(e);
        return { error: "An error occurred while cleaning the database." };
    }
}
