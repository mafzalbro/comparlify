'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

import { generateTitle } from '@/ai/flows/ai-title-generator';
import { aiQueryComparlifyChatbot, AIQueryComparlifyChatbotInput } from '@/ai/flows/ai-query-comparlify-chatbot';
import { createSession, deleteSession } from '@/lib/auth';

// --- Title Generator Action ---

const titleSchema = z.object({
  courseDescription: z.string().min(10, { message: 'Description must be at least 10 characters long.' }).max(5000, { message: 'Description must be less than 5000 characters.'}),
});

interface TitleFormState {
    courseTitle: string | null;
    error: {
        courseDescription?: string[];
    } | string | null;
}

export async function generateCourseTitleAction(prevState: TitleFormState, formData: FormData): Promise<TitleFormState> {
  const validatedFields = titleSchema.safeParse({
    courseDescription: formData.get('courseDescription'),
  });

  if (!validatedFields.success) {
    return {
      courseTitle: null,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    const { courseTitle } = await generateTitle({ courseDescription: validatedFields.data.courseDescription });
    return { courseTitle, error: null };
  } catch (error) {
    console.error(error);
    return { courseTitle: null, error: 'Failed to generate title. Please try again.' };
  }
}


// --- Chatbot Action ---

const chatSchema = z.object({
  query: z.string().min(1, { message: 'Query cannot be empty.' }).max(1000, {message: 'Query is too long.'}),
});

export async function getChatbotResponse(input: AIQueryComparlifyChatbotInput) {
  const validatedFields = chatSchema.safeParse(input);
  if (!validatedFields.success) {
    return { response: 'Invalid query.', error: true };
  }

  try {
    const chatbotResponse = await aiQueryComparlifyChatbot(validatedFields.data);
    if (!chatbotResponse) {
      throw new Error("No response from AI");
    }
    return { response: chatbotResponse.response, error: false };
  } catch (error) {
    console.error(error);
    return { response: 'Sorry, I am having trouble connecting. Please try again later.', error: true };
  }
}

// --- Auth Actions ---

const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
});

interface AuthFormState {
  error: string | null;
  success: boolean;
}

export async function registerUser(prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const validatedFields = registerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    return { error: errors.email?.[0] || errors.password?.[0] || 'Invalid input.', success: false };
  }
  
  const { email, password } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: 'An account with this email already exists.', success: false };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, password: hashedPassword },
    });

  } catch (error) {
    console.error(error);
    return { error: 'Could not create account. Please try again.', success: false };
  }
  
  redirect('/login');
}


const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export async function loginUser(prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors;
        return { error: errors.email?.[0] || errors.password?.[0] || 'Invalid input.', success: false };
    }

    const { email, password } = validatedFields.data;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return { error: 'Invalid email or password.', success: false };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return { error: 'Invalid email or password.', success: false };
        }
        
        await createSession(user.id);

    } catch (error) {
        console.error(error);
        return { error: 'An unexpected error occurred. Please try again.', success: false };
    }

    redirect('/admin');
}

export async function logout() {
    await deleteSession();
    redirect('/login');
}
