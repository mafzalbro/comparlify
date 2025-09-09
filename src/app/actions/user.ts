
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

// --- User Onboarding Action ---
export async function markUserAsOnboarded() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated.');
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboarded: true },
  });

  revalidatePath('/');
}

// --- User Profile/Settings Actions ---
const updateUserProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  newsletter: z.preprocess((val) => val === 'on', z.boolean()),
});

interface UpdateProfileState {
  error: {
    name?: string[];
    newsletter?: string[];
  } | string | null;
  success: boolean;
}

export async function updateUserProfileAction(
  prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be logged in to update your profile.', success: false };
  }

  const validatedFields = updateUserProfileSchema.safeParse({
    name: formData.get('name'),
    newsletter: formData.get('newsletter'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: validatedFields.data,
    });
    revalidatePath('/panel/settings');
    revalidatePath('/profile');
    return { error: null, success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: 'Failed to update profile.', success: false };
  }
}

// --- User Role Management ---
export async function updateUserRole(userId: string, role: Role) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Not authorized');
    }
    if (session.user.id === userId) {
        throw new Error('Admins cannot change their own role.');
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role },
        });
        revalidatePath('/admin/users');
    } catch (error) {
        console.error('Failed to update user role:', error);
        throw new Error('Failed to update user role.');
    }
}

// --- Delete User Account ---
export async function deleteSelfAction() {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'User not authenticated.' };
    }

    try {
        await prisma.user.delete({
            where: { id: session.user.id }
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to delete user account:", error);
        return { error: 'There was an error deleting your account. Please try again.' };
    }
}
