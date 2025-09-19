
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

// --- Blog Category Actions ---
const blogCategorySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long."),
    slug: z.string().min(2, "Slug must be at least 2 characters long."),
});

export async function createBlogCategory(prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }
    const validatedFields = blogCategorySchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await prisma.postCategory.create({ data: validatedFields.data });
        revalidatePath('/admin/blog/categories');
    } catch (error) {
        console.error(error);
        return { error: "Failed to create category." };
    }
    redirect('/admin/blog/categories');
}

export async function updateBlogCategory(id: string, prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }
    const validatedFields = blogCategorySchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await prisma.postCategory.update({
            where: { id },
            data: validatedFields.data,
        });
        revalidatePath('/admin/blog/categories');
    } catch (error) {
        console.error(error);
        return { error: "Failed to update category." };
    }
    redirect('/admin/blog/categories');
}

export async function deleteBlogCategory(prevState: { error: string | null }, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }
    const id = formData.get('id') as string;
    if (!id) {
        return { error: "Category ID is missing." };
    }
    try {
        await prisma.postCategory.delete({ where: { id } });
        revalidatePath('/admin/blog/categories');
        return { error: null };
    } catch (error) {
        if (error instanceof prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
            return { error: "Cannot delete category. It still contains posts." };
        }
        console.error(error);
        return { error: "Failed to delete category." };
    }
}


// --- Comparison Category Actions ---
const comparisonCategorySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long."),
    slug: z.string().min(2, "Slug must be at least 2 characters long."),
});

export async function createComparisonCategory(prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }
    const validatedFields = comparisonCategorySchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await prisma.comparisonCategory.create({ data: validatedFields.data });
        revalidatePath('/admin/comparisons/categories');
    } catch (error) {
        console.error(error);
        return { error: "Failed to create category." };
    }
    redirect('/admin/comparisons/categories');
}

export async function updateComparisonCategory(id: string, prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }
    const validatedFields = comparisonCategorySchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await prisma.comparisonCategory.update({
            where: { id },
            data: validatedFields.data,
        });
        revalidatePath('/admin/comparisons/categories');
    } catch (error) {
        console.error(error);
        return { error: "Failed to update category." };
    }
    redirect('/admin/comparisons/categories');
}

export async function deleteComparisonCategory(prevState: { error: string | null }, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }
    const id = formData.get('id') as string;
    if (!id) {
        return { error: "Category ID is missing." };
    }
    try {
        await prisma.comparisonCategory.delete({ where: { id } });
        revalidatePath('/admin/comparisons/categories');
        return { error: null };
    } catch (error) {
        if (error instanceof prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
            return { error: "Cannot delete category. It still contains comparisons." };
        }
        console.error(error);
        return { error: "Failed to delete category." };
    }
}
