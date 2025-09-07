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

// --- Blog Post Actions ---

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

export async function createPost(formData: FormData) {
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

export async function updatePost(id: string, formData: FormData) {
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

export async function deletePost(id: string) {
  try {
    await prisma.post.delete({
      where: { id },
    });
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete post." };
  }
  redirect("/admin/blog");
}
