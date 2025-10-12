
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

const legalDocumentSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long."),
    slug: z.string().min(3, "Slug must be at least 3 characters long."),
    content: z.string().min(20, "Content must be at least 20 characters long."),
    published: z.preprocess((val) => val === "on", z.boolean()),
});

export async function createLegalDocument(prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }
    const validatedFields = legalDocumentSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await prisma.legalDocument.create({ data: validatedFields.data });
        revalidatePath('/admin/legal');
        revalidatePath('/legal', 'layout');
    } catch (error) {
        console.error(error);
        return { error: "Failed to create document." };
    }
    redirect('/admin/legal');
}

export async function updateLegalDocument(id: string, prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }
    const validatedFields = legalDocumentSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await prisma.legalDocument.update({
            where: { id },
            data: validatedFields.data,
        });
        revalidatePath('/admin/legal');
        revalidatePath(`/legal/${validatedFields.data.slug}`);
    } catch (error) {
        console.error(error);
        return { error: "Failed to update document." };
    }
    redirect('/admin/legal');
}

export async function deleteLegalDocument(prevState: { error: string | null }, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }
    const id = formData.get('id') as string;
    if (!id) {
        return { error: "Document ID is missing." };
    }
    try {
        await prisma.legalDocument.delete({ where: { id } });
        revalidatePath('/admin/legal');
        revalidatePath('/legal', 'layout');
        return { error: null };
    } catch (error) {
        console.error(error);
        return { error: "Failed to delete document." };
    }
}
