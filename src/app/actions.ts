'use server';

import { generateTitle } from '@/ai/flows/ai-title-generator';
import { aiQueryComparlifyChatbot, AIQueryComparlifyChatbotInput } from '@/ai/flows/ai-query-comparlify-chatbot';
import { z } from 'zod';

const titleSchema = z.object({
  courseDescription: z.string().min(10, { message: 'Description must be at least 10 characters long.' }).max(5000, { message: 'Description must be less than 5000 characters.'}),
});

interface FormState {
    courseTitle: string | null;
    error: {
        courseDescription?: string[];
    } | string | null;
}

export async function generateCourseTitleAction(prevState: FormState, formData: FormData): Promise<FormState> {
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
