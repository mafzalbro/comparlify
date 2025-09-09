
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

// --- Feature Actions ---
const featureSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long."),
    categoryId: z.string().min(1, "You must select a category."),
});

export async function createFeature(prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }
    const validatedFields = featureSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await prisma.feature.create({ data: validatedFields.data });
        revalidatePath('/admin/features');
    } catch (error) {
        console.error(error);
        return { error: "Failed to create feature." };
    }
    redirect('/admin/features');
}

export async function updateFeature(id: string, prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }
    const validatedFields = featureSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await prisma.feature.update({
            where: { id },
            data: validatedFields.data,
        });
        revalidatePath('/admin/features');
    } catch (error) {
        console.error(error);
        return { error: "Failed to update feature." };
    }
    redirect('/admin/features');
}

export async function deleteFeature(prevState: { error: string | null }, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }
    const id = formData.get('id') as string;
    if (!id) {
        return { error: "Feature ID is missing." };
    }
    try {
        await prisma.feature.delete({ where: { id } });
        revalidatePath('/admin/features');
        return { error: null };
    } catch (error) {
        if (error instanceof prisma.PrismaClientKnownRequestError) {
            // P2003 is the error code for foreign key constraint failure
            if (error.code === 'P2003') {
                return { error: "Cannot delete feature. It is currently in use by one or more platforms." };
            }
        }
        console.error(error);
        return { error: "Failed to delete feature. An unknown error occurred." };
    }
}

// --- Feature Category Actions ---
const featureCategorySchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long."),
});

export async function createFeatureCategory(prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }
    const validatedFields = featureCategorySchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await prisma.featureCategory.create({ data: validatedFields.data });
        revalidatePath('/admin/features/categories');
        revalidatePath('/admin/features');
    } catch (error) {
        console.error(error);
        return { error: "Failed to create category." };
    }
    redirect('/admin/features/categories');
}

export async function updateFeatureCategory(id: string, prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }
    const validatedFields = featureCategorySchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await prisma.featureCategory.update({
            where: { id },
            data: validatedFields.data,
        });
        revalidatePath('/admin/features/categories');
        revalidatePath('/admin/features');
    } catch (error) {
        console.error(error);
        return { error: "Failed to update category." };
    }
    redirect('/admin/features/categories');
}

export async function deleteFeatureCategory(prevState: { error: string | null }, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }
    const id = formData.get('id') as string;
    if (!id) {
        return { error: "Category ID is missing." };
    }
    try {
        await prisma.featureCategory.delete({ where: { id } });
        revalidatePath('/admin/features/categories');
        revalidatePath('/admin/features');
        return { error: null };
    } catch (error) {
        if (error instanceof prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
                return { error: "Cannot delete category. It still contains features." };
            }
        }
        console.error(error);
        return { error: "Failed to delete category. An unknown error occurred." };
    }
}
