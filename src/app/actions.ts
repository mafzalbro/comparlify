
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { generateTitle } from "@/ai/flows/ai-title-generator";
import { generateCourseOutline } from "@/ai/flows/ai-course-outliner";
import { generateVideoScript } from "@/ai/flows/ai-video-scripter";
import {
  aiQueryComparlifyChatbot,
  type AIQueryComparlifyChatbotInput,
} from "@/ai/flows/ai-query-comparlify-chatbot";
import { generateLessonSummary } from "@/ai/flows/ai-lesson-summarizer";
import { generateQuiz } from "@/ai/flows/ai-quiz-generator";
import { generateAudiencePersona } from "@/ai/flows/ai-audience-persona-generator";
import { generateCourseDescription } from "@/ai/flows/ai-course-description-writer";
import { generateLearningObjectives } from "@/ai/flows/ai-learning-objectives-generator";
import { generateEmailSubjectLines } from "@/ai/flows/ai-email-subject-line-generator";
import { generateSocialMediaPost } from "@/ai/flows/ai-social-media-post-generator";
import { generateFaqs } from "@/ai/flows/ai-faq-generator";
import { generateAnalogy } from "@/ai/flows/ai-analogy-generator";
import { generateGenericContent } from "@/ai/flows/ai-generic-content-generator";
import { auth } from "@/lib/auth";
import type { Post } from "@prisma/client";
import nodemailer from "nodemailer";
import { cache } from "react";

// --- Cache Management Action ---
export async function revalidateCacheAction(path: 'all' | 'blog' | 'compare') {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { error: "Not authorized" };
    }
    
    try {
        if (path === 'all') {
            revalidatePath('/', 'layout');
        } else {
            revalidatePath(`/${path}`, 'layout');
        }
        return { success: `Successfully revalidated ${path} pages.` };
    } catch (error) {
        console.error("Revalidation error:", error);
        return { error: `Failed to revalidate ${path} pages.` };
    }
}


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


// --- Title Generator Action ---

const titleSchema = z.object({
  courseDescription: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long." })
    .max(5000, { message: "Description must be less than 5000 characters." }),
});

interface TitleFormState {
  courseTitle: string | null;
  error:
    | {
        courseDescription?: string[];
      }
    | string
    | null;
}

export async function generateCourseTitleAction(
  prevState: TitleFormState,
  formData: FormData
): Promise<TitleFormState> {
  const validatedFields = titleSchema.safeParse({
    courseDescription: formData.get("courseDescription"),
  });

  if (!validatedFields.success) {
    return {
      courseTitle: null,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { courseTitle } = await generateTitle({
      courseDescription: validatedFields.data.courseDescription,
    });
    return { courseTitle, error: null };
  } catch (error) {
    console.error(error);
    return {
      courseTitle: null,
      error: "Failed to generate title. Please try again.",
    };
  }
}

// --- Course Outliner Action ---

const courseOutlineSchema = z.object({
  courseDescription: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long." })
    .max(5000, { message: "Description must be less than 5000 characters." }),
});

interface CourseOutlineState {
  courseOutline: string | null;
  error:
    | {
        courseDescription?: string[];
      }
    | string
    | null;
}

export async function generateCourseOutlineAction(
  prevState: CourseOutlineState,
  formData: FormData
): Promise<CourseOutlineState> {
  const validatedFields = courseOutlineSchema.safeParse({
    courseDescription: formData.get("courseDescription"),
  });

  if (!validatedFields.success) {
    return {
      courseOutline: null,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateCourseOutline({
      courseDescription: validatedFields.data.courseDescription,
    });
    return { courseOutline: result.courseOutline, error: null };
  } catch (error) {
    console.error(error);
    return {
      courseOutline: null,
      error: "Failed to generate outline. Please try again.",
    };
  }
}

// --- Video Scripter Action ---
const videoScriptSchema = z.object({
  lessonTopic: z
    .string()
    .min(5, { message: "Topic must be at least 5 characters long." })
    .max(1000, { message: "Topic must be less than 1000 characters." }),
  videoDuration: z.coerce
    .number()
    .min(1, { message: "Duration must be at least 1 minute." })
    .max(30, { message: "Duration cannot exceed 30 minutes." }),
});

interface VideoScriptState {
  videoScript: string | null;
  error:
    | {
        lessonTopic?: string[];
        videoDuration?: string[];
      }
    | string
    | null;
}

export async function generateVideoScriptAction(
  prevState: VideoScriptState,
  formData: FormData
): Promise<VideoScriptState> {
  const validatedFields = videoScriptSchema.safeParse({
    lessonTopic: formData.get("lessonTopic"),
    videoDuration: formData.get("videoDuration"),
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
    return {
      videoScript: null,
      error: "Failed to generate script. Please try again.",
    };
  }
}

// --- Chatbot Action ---

const chatSchema = z.object({
  query: z
    .string()
    .min(1, { message: "Query cannot be empty." })
    .max(1000, { message: "Query is too long." }),
  history: z.array(
    z.object({
      role: z.enum(["user", "model"]),
      content: z.array(
        z.object({
          text: z.string(),
        })
      ),
    })
  ),
});

export async function getChatbotResponse(input: AIQueryComparlifyChatbotInput) {
  const validatedFields = chatSchema.safeParse(input);
  if (!validatedFields.success) {
    console.error(validatedFields.error);
    return { response: "Invalid query.", error: true };
  }

  try {
    const chatbotResponse = await aiQueryComparlifyChatbot(
      validatedFields.data
    );
    if (!chatbotResponse) {
      throw new Error("No response from AI");
    }
    return { response: chatbotResponse.response, error: false };
  } catch (error) {
    console.error(error);
    return {
      response:
        "Sorry, I am having trouble connecting. Please try again later.",
      error: true,
    };
  }
}

// --- Lesson Summarizer Action ---
const lessonSummarySchema = z.object({
  lessonContent: z
    .string()
    .min(20, { message: "Content must be at least 20 characters long." })
    .max(10000, { message: "Content must be less than 10000 characters." }),
});

interface LessonSummaryState {
  summary: string | null;
  error:
    | {
        lessonContent?: string[];
      }
    | string
    | null;
}

export async function generateLessonSummaryAction(
  prevState: LessonSummaryState,
  formData: FormData
): Promise<LessonSummaryState> {
  const validatedFields = lessonSummarySchema.safeParse({
    lessonContent: formData.get("lessonContent"),
  });

  if (!validatedFields.success) {
    return {
      summary: null,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateLessonSummary(validatedFields.data);
    return { summary: result.summary, error: null };
  } catch (error) {
    console.error(error);
    return {
      summary: null,
      error: "Failed to generate summary. Please try again.",
    };
  }
}

// --- Quiz Generator Action ---
const quizSchema = z.object({
  textContent: z
    .string()
    .min(20, { message: "Content must be at least 20 characters long." })
    .max(10000, { message: "Content must be less than 10000 characters." }),
  numQuestions: z.coerce.number().min(1).max(10),
});

interface QuizState {
  quiz: string | null;
  error:
    | {
        textContent?: string[];
        numQuestions?: string[];
      }
    | string
    | null;
}

export async function generateQuizAction(
  prevState: QuizState,
  formData: FormData
): Promise<QuizState> {
  const validatedFields = quizSchema.safeParse({
    textContent: formData.get("textContent"),
    numQuestions: formData.get("numQuestions"),
  });

  if (!validatedFields.success) {
    return {
      quiz: null,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateQuiz(validatedFields.data);
    return { quiz: result.quiz, error: null };
  } catch (error) {
    console.error(error);
    return { quiz: null, error: "Failed to generate quiz. Please try again." };
  }
}

// --- Audience Persona Generator Action ---
const personaSchema = z.object({
  courseIdea: z
    .string()
    .min(10, { message: "Idea must be at least 10 characters long." })
    .max(2000),
});

interface PersonaState {
  persona: string | null;
  error:
    | {
        courseIdea?: string[];
      }
    | string
    | null;
}

export async function generateAudiencePersonaAction(
  prevState: PersonaState,
  formData: FormData
): Promise<PersonaState> {
  const validatedFields = personaSchema.safeParse({
    courseIdea: formData.get("courseIdea"),
  });

  if (!validatedFields.success) {
    return {
      persona: null,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateAudiencePersona(validatedFields.data);
    return { persona: result.persona, error: null };
  } catch (error) {
    console.error(error);
    return {
      persona: null,
      error: "Failed to generate persona. Please try again.",
    };
  }
}

// --- Course Description Writer Action ---
const courseDescriptionSchema = z.object({
  courseTitle: z
    .string()
    .min(5, { message: "Title must be at least 5 characters long." })
    .max(200),
  keyTopics: z
    .string()
    .min(10, { message: "Topics must be at least 10 characters long." })
    .max(2000),
});

interface CourseDescriptionState {
  description: string | null;
  error:
    | {
        courseTitle?: string[];
        keyTopics?: string[];
      }
    | string
    | null;
}

export async function generateCourseDescriptionAction(
  prevState: CourseDescriptionState,
  formData: FormData
): Promise<CourseDescriptionState> {
  const validatedFields = courseDescriptionSchema.safeParse({
    courseTitle: formData.get("courseTitle"),
    keyTopics: formData.get("keyTopics"),
  });

  if (!validatedFields.success) {
    return {
      description: null,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateCourseDescription(validatedFields.data);
    return { description: result.description, error: null };
  } catch (error) {
    console.error(error);
    return {
      description: null,
      error: "Failed to generate description. Please try again.",
    };
  }
}

// --- Learning Objectives Generator Action ---
const learningObjectivesSchema = z.object({
  courseTopic: z
    .string()
    .min(10, { message: "Topic must be at least 10 characters long." })
    .max(2000),
});

interface LearningObjectivesState {
  objectives: string | null;
  error:
    | {
        courseTopic?: string[];
      }
    | string
    | null;
}

export async function generateLearningObjectivesAction(
  prevState: LearningObjectivesState,
  formData: FormData
): Promise<LearningObjectivesState> {
  const validatedFields = learningObjectivesSchema.safeParse({
    courseTopic: formData.get("courseTopic"),
  });

  if (!validatedFields.success) {
    return {
      objectives: null,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateLearningObjectives(validatedFields.data);
    return { objectives: result.objectives, error: null };
  } catch (error) {
    console.error(error);
    return {
      objectives: null,
      error: "Failed to generate objectives. Please try again.",
    };
  }
}

// --- Email Subject Line Generator Action ---
const emailSubjectLineSchema = z.object({
  emailContent: z
    .string()
    .min(10, { message: "Content must be at least 10 characters long." })
    .max(2000),
});

interface EmailSubjectLineState {
  subjectLines: string | null;
  error:
    | {
        emailContent?: string[];
      }
    | string
    | null;
}

export async function generateEmailSubjectLinesAction(
  prevState: EmailSubjectLineState,
  formData: FormData
): Promise<EmailSubjectLineState> {
  const validatedFields = emailSubjectLineSchema.safeParse({
    emailContent: formData.get("emailContent"),
  });

  if (!validatedFields.success) {
    return {
      subjectLines: null,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateEmailSubjectLines(validatedFields.data);
    return { subjectLines: result.subjectLines, error: null };
  } catch (error) {
    console.error(error);
    return {
      subjectLines: null,
      error: "Failed to generate subject lines. Please try again.",
    };
  }
}

// --- Social Media Post Generator Action ---
const socialMediaPostSchema = z.object({
  postTopic: z.string().min(10).max(1000),
  platform: z.string(),
});

interface SocialMediaPostState {
  post: string | null;
  error:
    | {
        postTopic?: string[];
        platform?: string[];
      }
    | string
    | null;
}

export async function generateSocialMediaPostAction(
  prevState: SocialMediaPostState,
  formData: FormData
): Promise<SocialMediaPostState> {
  const validatedFields = socialMediaPostSchema.safeParse({
    postTopic: formData.get("postTopic"),
    platform: formData.get("platform"),
  });

  if (!validatedFields.success) {
    return {
      post: null,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateSocialMediaPost(validatedFields.data);
    return { post: result.post, error: null };
  } catch (error) {
    console.error(error);
    return { post: null, error: "Failed to generate post. Please try again." };
  }
}

// --- FAQ Generator Action ---
const faqSchema = z.object({
  topicContent: z.string().min(20).max(10000),
});

interface FaqState {
  faqs: string | null;
  error:
    | {
        topicContent?: string[];
      }
    | string
    | null;
}

export async function generateFaqsAction(
  prevState: FaqState,
  formData: FormData
): Promise<FaqState> {
  const validatedFields = faqSchema.safeParse({
    topicContent: formData.get("topicContent"),
  });

  if (!validatedFields.success) {
    return {
      faqs: null,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateFaqs(validatedFields.data);
    return { faqs: result.faqs, error: null };
  } catch (error) {
    console.error(error);
    return { faqs: null, error: "Failed to generate FAQs. Please try again." };
  }
}

// --- Analogy Generator Action ---
const analogySchema = z.object({
  complexTopic: z.string().min(10).max(1000),
});

interface AnalogyState {
  analogy: string | null;
  error:
    | {
        complexTopic?: string[];
      }
    | string
    | null;
}

export async function generateAnalogyAction(
  prevState: AnalogyState,
  formData: FormData
): Promise<AnalogyState> {
  const validatedFields = analogySchema.safeParse({
    complexTopic: formData.get("complexTopic"),
  });

  if (!validatedFields.success) {
    return {
      analogy: null,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateAnalogy(validatedFields.data);
    return { analogy: result.analogy, error: null };
  } catch (error) {
    console.error(error);
    return {
      analogy: null,
      error: "Failed to generate analogy. Please try again.",
    };
  }
}


// --- AI Generic Content Generator ---
const genericContentSchema = z.object({
    fieldType: z.string(),
    topic: z.string(),
    context: z.string().optional(),
});

interface GenericContentState {
    generatedContent: string | null;
    error: string | null;
}

export async function generateGenericContentAction(
    input: z.infer<typeof genericContentSchema>
): Promise<GenericContentState> {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { generatedContent: null, error: "Not authorized." };
    }

    const validatedFields = genericContentSchema.safeParse(input);
    if (!validatedFields.success) {
        return { generatedContent: null, error: "Invalid input." };
    }

    try {
        const result = await generateGenericContent(validatedFields.data);
        return { generatedContent: result.generatedContent, error: null };
    } catch (error) {
        console.error(error);
        return { generatedContent: null, error: "Failed to generate content. Please try again." };
    }
}


// --- Blog Post Actions ---

export const getPostPreview = cache(async (slug: string): Promise<Post | null> => {
    return prisma.post.findUnique({
        where: { slug },
        select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            image: true,
            content: true,
            authorId: true,
            createdAt: true,
            dataAiHint: true,
            nextId: true,
            previousId: true,
            published: true,
            updatedAt: true,
        }
    });
});


const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  slug: z.string().min(3, "Slug must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  content: z.string().min(20, "Content must be at least 20 characters long"),
  image: z.string().url("Must be a valid URL"),
  dataAiHint: z.string().optional(),
  published: z.preprocess((val) => val === "on", z.boolean()),
});

export async function createPost(prevState: any, formData: FormData) {
  const validatedFields = postSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    console.error(validatedFields.error);
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    // For now, hardcode the authorId. In a real app, you'd get this from the session.
    const authorId = "clxp9uvt0000012o2ax9f5kku";

    await prisma.post.create({
      data: {
        ...validatedFields.data,
        authorId,
      },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
  } catch (error) {
    console.error(error);
    return { error: "Failed to create post." };
  }
  redirect("/admin/blog");
}

export async function updatePost(id: string, prevState: any, formData: FormData) {
  const validatedFields = postSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    console.error(validatedFields.error);
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await prisma.post.update({
      where: { id },
      data: validatedFields.data,
    });
    revalidatePath("/admin/blog");
    revalidatePath(`/blog/${validatedFields.data.slug}`);
  } catch (error) {
    console.error(error);
    return { error: "Failed to update post." };
  }

  redirect("/admin/blog");
}

export async function deletePost(prevState: { error: string | null }, formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) {
    return { error: "Post ID is missing." };
  }
  try {
    await prisma.post.delete({
      where: { id },
    });
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { error: null }
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete post." };
  }
}

// --- Comment Actions ---
const addCommentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty.").max(1000, "Comment is too long."),
    postId: z.string(),
});

export async function addCommentAction(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be logged in to comment.", success: false };
    }

    const validatedFields = addCommentSchema.safeParse({
        content: formData.get("content"),
        postId: formData.get("postId"),
    });

    if (!validatedFields.success) {
        return { error: "Invalid comment data.", success: false };
    }

    try {
        await prisma.comment.create({
            data: {
                content: validatedFields.data.content,
                postId: validatedFields.data.postId,
                authorId: session.user.id,
                status: 'PENDING',
            },
        });
        const post = await prisma.post.findUnique({ where: { id: validatedFields.data.postId }, select: { slug: true }});
        if (post) {
          revalidatePath(`/blog/${post.slug}`);
        }
        revalidatePath('/admin/comments');
        return { error: null, success: true }
    } catch (error) {
        console.error(error);
        return { error: "Failed to add comment.", success: false };
    }
}

const updateCommentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty.").max(1000, "Comment is too long."),
    commentId: z.string(),
});

export async function updateCommentAction(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be logged in to edit comments.", success: false };
    }

    const validatedFields = updateCommentSchema.safeParse({
        content: formData.get("content"),
        commentId: formData.get("commentId"),
    });

    if (!validatedFields.success) {
        return { error: "Invalid comment data.", success: false };
    }
    
    const { commentId, content } = validatedFields.data;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.authorId !== session.user.id) {
        return { error: "You are not authorized to edit this comment.", success: false };
    }

    try {
        await prisma.comment.update({
            where: { id: commentId },
            data: {
                content,
                status: 'PENDING' // Re-submit for approval after edit
            }
        });
        
        const post = await prisma.post.findUnique({ where: { id: comment.postId }, select: { slug: true }});
        if (post) {
          revalidatePath(`/blog/${post.slug}`);
        }
        revalidatePath('/admin/comments');
        return { error: null, success: true };
    } catch(error) {
        console.error(error);
        return { error: "Failed to update comment.", success: false };
    }
}


export async function approveCommentAction(commentId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Not authorized');
    }
    await prisma.comment.update({
        where: { id: commentId },
        data: { status: 'APPROVED' },
    });
    revalidatePath('/admin/comments');
    // Also revalidate the specific blog post if possible, or just the whole blog
    const comment = await prisma.comment.findUnique({ where: { id: commentId }, include: { post: { select: { slug: true }}}});
    if (comment) {
        revalidatePath(`/blog/${comment.post.slug}`);
    }
}

export async function rejectCommentAction(commentId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Not authorized');
    }
    await prisma.comment.update({
        where: { id: commentId },
        data: { status: 'REJECTED' },
    });
    revalidatePath('/admin/comments');
    const comment = await prisma.comment.findUnique({ where: { id: commentId }, include: { post: { select: { slug: true }}}});
    if (comment) {
        revalidatePath(`/blog/${comment.post.slug}`);
    }
}



// --- Comparison Actions ---

const comparisonSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  summary: z.string().min(10),
  platformAId: z.string(),
  platformBId: z.string(),
  introduction: z.string().min(20),
  conclusion: z.string().min(20),
  published: z.preprocess((val) => val === "on", z.boolean()),
}).refine(data => data.platformAId !== data.platformBId, {
    message: "Platform A and Platform B cannot be the same.",
    path: ["platformBId"],
});

function parseDynamicArray(formData: FormData, arrayName: string) {
    const arrayData = [];
    const keys = Array.from(formData.keys());
    
    const regex = new RegExp(`^${arrayName}\\[(\\d+)\\]\\[(.*?)\\]$`);
    const items: Record<string, Record<string, any>> = {};

    for (const key of keys) {
        const match = key.match(regex);
        if (match) {
            const [, index, field] = match;
            if (!items[index]) {
                items[index] = {};
            }
            items[index][field] = formData.get(key);
        }
    }
    return Object.values(items).filter(item => {
      // Filter out empty items before processing
      return Object.values(item).some(value => value !== '');
    });
}

export async function createComparison(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = comparisonSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const factsData = parseDynamicArray(formData, 'facts').map(fact => ({
      title: fact.title as string,
      platformAValue: fact.platformAValue as string,
      platformBValue: fact.platformBValue as string,
  }));

  const faqsData = parseDynamicArray(formData, 'faqs').map(faq => ({
      question: faq.question as string,
      answer: faq.answer as string,
  }));

  try {
    await prisma.comparison.create({ 
        data: {
            ...validatedFields.data,
            facts: {
                create: factsData
            },
            faqs: {
                create: faqsData
            }
        }
    });
    revalidatePath('/admin/comparisons');
    revalidatePath('/compare');
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create comparison.' };
  }

  redirect('/admin/comparisons');
}

export async function updateComparison(id: string, prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = comparisonSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }
  
  const factsData = parseDynamicArray(formData, 'facts');
  const faqsData = parseDynamicArray(formData, 'faqs');
  
  try {
    await prisma.$transaction(async (tx) => {
        await tx.comparison.update({
            where: { id },
            data: {
                ...validatedFields.data,
                facts: { deleteMany: {} }, // Clear existing facts
                faqs: { deleteMany: {} }, // Clear existing FAQs
            },
        });
        
        if (factsData.length > 0) {
            await tx.fact.createMany({
                data: factsData.map(fact => ({
                    ...fact,
                    comparisonId: id,
                })) as any,
            });
        }
        
        if (faqsData.length > 0) {
             await tx.faq.createMany({
                data: faqsData.map(faq => ({
                    ...faq,
                    comparisonId: id,
                })) as any,
            });
        }
    });
    
    revalidatePath('/admin/comparisons');
    revalidatePath(`/compare/${validatedFields.data.slug}`);
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update comparison.' };
  }

  redirect('/admin/comparisons');
}

export async function deleteComparison(prevState: { error: string | null }, formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) {
    return { error: "Comparison ID is missing." };
  }
  try {
    await prisma.comparison.delete({ where: { id } });
    revalidatePath('/admin/comparisons');
    revalidatePath('/compare');
    return { error: null };
  } catch (error)
  {
    console.error(error);
    return { error: 'Failed to delete comparison.' };
  }
}

// --- Subscription Action ---

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

// --- Contact Form Action ---

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

  const { name, email, message } = validatedFields.data;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: process.env.SMTP_FROM_EMAIL, // Send to yourself
      replyTo: email,
      subject: `New contact form message from ${name}`,
      html: `
        <h1>New Contact Message</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });
    return { error: null, success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      error: "Sorry, we couldn't send your message at this time. Please try again later.",
      success: false,
    };
  }
}

// --- Platform Actions ---

const platformSchema = z.object({
    name: z.string().min(2),
    website: z.string().url(),
    logoUrl: z.string().url(),
    description: z.string().min(10),
    rating: z.string().transform(val => val === '' ? null : Number(val)).pipe(z.number().min(0).max(5).nullable()),
    easeOfUse: z.string().transform(val => val === '' ? null : Number(val)).pipe(z.number().min(0).max(5).nullable()),
    featuresRating: z.string().transform(val => val === '' ? null : Number(val)).pipe(z.number().min(0).max(5).nullable()),
    support: z.string().transform(val => val === '' ? null : Number(val)).pipe(z.number().min(0).max(5).nullable()),
});

type PlatformActionState = {
    error: {
        name?: string[];
        website?: string[];
        logoUrl?: string[];
        description?: string[];
        rating?: string[];
        easeOfUse?: string[];
        featuresRating?: string[];
        support?: string[];
    } | string | null;
}


export async function createPlatform(prevState: any, formData: FormData) {
  const validatedFields = platformSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }
  
  try {
    await prisma.platform.create({
      data: validatedFields.data,
    });
    revalidatePath('/admin/platforms');
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create platform.' };
  }
  
  redirect('/admin/platforms');
}


export async function updatePlatform(id: string, prevState: any, formData: FormData) {
  const formDataObj = Object.fromEntries(formData.entries());
  
  const validatedFields = platformSchema.safeParse(formDataObj);
  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const featuresUpdateData = Object.entries(formDataObj)
    .filter(([key]) => key.startsWith('features['))
    .reduce((acc, [key, value]) => {
      const match = key.match(/features\[(.*?)\]\.(.*)/);
      if (match) {
        const [, featureId, field] = match;
        if (!acc[featureId]) {
          acc[featureId] = {};
        }
        acc[featureId][field] = value;
      }
      return acc;
    }, {} as Record<string, any>);


  try {
    await prisma.$transaction(async (tx) => {
      await tx.platform.update({
        where: { id },
        data: validatedFields.data,
      });

      for (const featureId in featuresUpdateData) {
        const featureData = featuresUpdateData[featureId];
        await tx.platformFeature.upsert({
          where: { platformId_featureId: { platformId: id, featureId } },
          create: {
            platformId: id,
            featureId,
            hasFeature: featureData.hasFeature === 'on',
            details: featureData.details || null,
          },
          update: {
            hasFeature: featureData.hasFeature === 'on',
            details: featureData.details || null,
          },
        });
      }
    });

    revalidatePath('/admin/platforms');
    revalidatePath(`/admin/platforms/edit/${id}`);
    revalidatePath('/compare');
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update platform.' };
  }

  redirect('/admin/platforms');
}


export async function deletePlatform(prevState: { error: string | null }, formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) {
    return { error: "Platform ID is missing." };
  }
  try {
    await prisma.platform.delete({ where: { id } });
    revalidatePath('/admin/platforms');
    revalidatePath('/compare');
    return { error: null };
  } catch (error)
  {
    console.error(error);
    return { error: 'Failed to delete platform.' };
  }
}

// --- Feature Actions ---
const featureSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long."),
    categoryId: z.string().min(1, "You must select a category."),
});

export async function createFeature(prevState: any, formData: FormData) {
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
