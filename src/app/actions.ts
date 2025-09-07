'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

import { generateTitle } from '@/ai/flows/ai-title-generator';
import { generateCourseOutline } from '@/ai/flows/ai-course-outliner';
import { generateVideoScript } from '@/ai/flows/ai-video-scripter';
import { aiQueryComparlifyChatbot, type AIQueryComparlifyChatbotInput } from '@/ai/flows/ai-query-comparlify-chatbot';


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

// --- Course Outliner Action ---

const courseOutlineSchema = z.object({
  courseDescription: z.string().min(10, { message: 'Description must be at least 10 characters long.' }).max(5000, { message: 'Description must be less than 5000 characters.'}),
});

interface CourseOutlineState {
  courseOutline: string | null;
  error: {
    courseDescription?: string[];
  } | string | null;
}

export async function generateCourseOutlineAction(prevState: CourseOutlineState, formData: FormData): Promise<CourseOutlineState> {
  const validatedFields = courseOutlineSchema.safeParse({
    courseDescription: formData.get('courseDescription'),
  });

  if (!validatedFields.success) {
    return {
      courseOutline: null,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateCourseOutline({ courseDescription: validatedFields.data.courseDescription });
    return { courseOutline: result.courseOutline, error: null };
  } catch (error) {
    console.error(error);
    return { courseOutline: null, error: 'Failed to generate outline. Please try again.' };
  }
}


// --- Video Scripter Action ---
const videoScriptSchema = z.object({
  lessonTopic: z.string().min(5, { message: 'Topic must be at least 5 characters long.' }).max(1000, { message: 'Topic must be less than 1000 characters.'}),
  videoDuration: z.coerce.number().min(1, {message: 'Duration must be at least 1 minute.'}).max(30, {message: 'Duration cannot exceed 30 minutes.'}),
});

interface VideoScriptState {
  videoScript: string | null;
  error: {
    lessonTopic?: string[];
    videoDuration?: string[];
  } | string | null;
}

export async function generateVideoScriptAction(prevState: VideoScriptState, formData: FormData): Promise<VideoScriptState> {
  const validatedFields = videoScriptSchema.safeParse({
    lessonTopic: formData.get('lessonTopic'),
    videoDuration: formData.get('videoDuration'),
  });

  if (!validatedFields.success) {
    return {
      videoScript: null,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateVideoScript(validatedFields.data);
    return { videoScript: result.videoScript, error: null };
  } catch (error) {
    console.error(error);
    return { videoScript: null, error: 'Failed to generate script. Please try again.' };
  }
}


// --- Chatbot Action ---

const chatSchema = z.object({
  query: z.string().min(1, { message: 'Query cannot be empty.' }).max(1000, {message: 'Query is too long.'}),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({
      text: z.string(),
    })),
  })),
});

export async function getChatbotResponse(input: AIQueryComparlifyChatbotInput) {
  const validatedFields = chatSchema.safeParse(input);
  if (!validatedFields.success) {
    console.error(validatedFields.error);
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
