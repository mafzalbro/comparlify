"use server";

import { seed, cleanupDatabase } from "@/prisma/seed";
import { auth } from "@/lib/auth";

export async function seedDatabaseAction() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { error: "Not authorized" };
    }
    
    try {
        await seed();
        return { success: "Database has been successfully cleaned and seeded." };
    } catch(e) {
        console.error(e);
        return { error: "An error occurred while seeding the database." };
    }
}

export async function cleanupDatabaseAction() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { error: "Not authorized" };
    }

    try {
        await cleanupDatabase();
        return { success: "Database has been successfully cleaned up." };
    } catch(e) {
        console.error(e);
        return { error: "An error occurred while cleaning the database." };
    }
}
