
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";

const subscribeSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

interface SubscribeState {
    message: string | null;
    error: string | null;
}

export async function subscribeAction(
  prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const validatedFields = subscribeSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      message: null,
      error: validatedFields.error.flatten().fieldErrors.email?.[0] || "Invalid input.",
    };
  }

  try {
    const existingSubscriber = await prisma.subscription.findUnique({
        where: { email: validatedFields.data.email },
    });

    if (existingSubscriber) {
        return { message: "You're already subscribed. Thanks for being part of our community!", error: null };
    }

    await prisma.subscription.create({
      data: {
        email: validatedFields.data.email,
      },
    });

    return { message: "Thanks for subscribing! You'll be the first to know about new updates.", error: null };
  } catch (error) {
    console.error(error);
    return {
      message: null,
      error: 'Something went wrong. Please try again later.',
    };
  }
}
