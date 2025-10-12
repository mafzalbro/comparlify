
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { $Enums, ContentType } from "@prisma/client";
import { z } from "zod";
import { redirect } from "next/navigation";

interface UpdateContentState {
  error: string | null;
  success: boolean;
}

export type AdminSettings = Record<
  string,
  {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: $Enums.ContentType;
    key: string;
    value: string;
    group: string;
  }[]
>;

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

export async function getSettingsContent(): Promise<AdminSettings> {
  const content = await prisma.siteContent.findMany({
    where: {
      OR: [{ group: "Email Settings" }, { group: "Globals" }, { group: "Code Injection" }],
    },
    orderBy: { key: "asc" },
  });

  const groupedContent = content.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof content>);

  return groupedContent;
}

const legalDocumentSchema = z.object({
    key: z.string().min(3, "Key must be at least 3 characters long."),
    value: z.string().min(20, "Content must be at least 20 characters long."),
});

export async function createLegalDocumentAction(prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }
    const validatedFields = legalDocumentSchema.safeParse({
        key: `legal.${formData.get('key')}`,
        value: formData.get('value'),
    });

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    try {
        await prisma.siteContent.create({ 
            data: {
                ...validatedFields.data,
                group: 'Legal Pages',
                type: 'MARKDOWN',
            } 
        });
        revalidatePath('/admin/legal');
        revalidatePath('/legal', 'layout');
    } catch (error) {
        console.error(error);
        if ((error as any).code === 'P2002') {
            return { error: { key: ["This key is already in use. Please choose a unique one."]}};
        }
        return { error: "Failed to create document." };
    }
    redirect('/admin/legal');
}


export async function updateLegalDocumentAction(id: string, prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { error: 'Not authorized' };
    }
    const validatedFields = legalDocumentSchema.safeParse({
        key: `legal.${formData.get('key')}`,
        value: formData.get('value'),
    });

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors };
    }

    try {
        const doc = await prisma.siteContent.findUnique({ where: { id }});
        if (!doc) return { error: "Document not found." };
        
        await prisma.siteContent.update({
            where: { id },
            data: {
                value: validatedFields.data.value,
            },
        });
        revalidatePath('/admin/legal');
        revalidatePath(`/legal/${doc.key.replace('legal.', '')}`);
    } catch (error) {
        console.error(error);
        return { error: "Failed to update document." };
    }
    redirect('/admin/legal');
}

export async function deleteLegalDocumentAction(prevState: { error: string | null }, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized' };
    }
    const id = formData.get('id') as string;
    if (!id) {
        return { error: "Document ID is missing." };
    }
    try {
        await prisma.siteContent.delete({ where: { id } });
        revalidatePath('/admin/legal');
        revalidatePath('/legal', 'layout');
        return { error: null };
    } catch (error) {
        console.error(error);
        return { error: "Failed to delete document." };
    }
}
