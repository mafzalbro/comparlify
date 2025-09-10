
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

interface ContactFormState {
  error: {
    name?: string[];
    email?: string[];
    message?: string[];
  } | string | null;
  success: boolean;
}

export async function sendContactMessageAction(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    await prisma.contactMessage.create({
      data: validatedFields.data,
    });
    return { error: null, success: true };
  } catch (error) {
    console.error("Failed to save contact message:", error);
    return {
      error: "Sorry, we couldn't send your message at this time. Please try again later.",
      success: false,
    };
  }
}


export async function toggleMessageReadStatus(id: string, read: boolean) {
    try {
        await prisma.contactMessage.update({
            where: { id },
            data: { read }
        });
        revalidatePath('/admin/contacts');
        return { success: true };
    } catch (error) {
        console.error('Failed to update message status:', error);
        return { error: 'Failed to update message status.' };
    }
}

export async function deleteContactMessage(id: string) {
    try {
        await prisma.contactMessage.delete({
            where: { id },
        });
        revalidatePath('/admin/contacts');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete message:', error);
        return { error: 'Failed to delete message.' };
    }
}

export async function bulkDeleteContactMessages(ids: string[]) {
    try {
        await prisma.contactMessage.deleteMany({
            where: {
                id: { in: ids }
            }
        });
        revalidatePath('/admin/contacts');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete messages:', error);
        return { error: 'Failed to delete messages.' };
    }
}
