
"use server";

import { z } from "zod";
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
import { generateImage } from "@/ai/flows/ai-image-generator";
import { generateLogo } from "@/ai/flows/ai-logo-generator";
import { generateCoursePrerequisites } from "@/ai/flows/ai-course-prerequisites-generator";
import { generateContentRepurposeIdeas } from "@/ai/flows/ai-content-repurposer";
import { generateIceBreakers } from "@/ai/flows/ai-ice-breaker-generator";
import { generatePromoVideoIdeas } from "@/ai/flows/ai-promotional-video-ideas-generator";
import { auth } from "@/lib/auth";

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
  existingContent: z.string().optional(),
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
    existingContent: formData.get("existingContent") || undefined,
  });

  if (!validatedFields.success) {
    return {
      courseOutline: null,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateCourseOutline(validatedFields.data);
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
  existingScript: z.string().optional(),
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
    existingScript: formData.get("existingScript") || undefined,
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
  existingContent: z.string().optional(),
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
    existingContent: formData.get("existingContent") || undefined,
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
  existingContent: z.string().optional(),
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
    existingContent: formData.get("existingContent") || undefined,
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
  existingContent: z.string().optional(),
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
    existingContent: formData.get("existingContent") || undefined,
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
  existingContent: z.string().optional(),
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
    existingContent: formData.get("existingContent") || undefined,
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
  existingContent: z.string().optional(),
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
    existingContent: formData.get("existingContent") || undefined,
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

// --- AI Image Generator ---
const imageGeneratorSchema = z.object({
    prompt: z.string().min(3, "Prompt must be at least 3 characters long."),
});

interface ImageGeneratorState {
    imageUrl: string | null;
    error: string | null;
}

export async function generateImageAction(
    input: z.infer<typeof imageGeneratorSchema>
): Promise<ImageGeneratorState> {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { imageUrl: null, error: "Not authorized." };
    }

    const validatedFields = imageGeneratorSchema.safeParse(input);
    if (!validatedFields.success) {
        return { imageUrl: null, error: "Invalid input." };
    }

    try {
        const result = await generateImage(validatedFields.data);
        return { imageUrl: result.imageUrl, error: null };
    } catch (error) {
        console.error(error);
        return { imageUrl: null, error: "Failed to generate image. Please try again." };
    }
}


// --- AI Logo Generator ---
const logoGeneratorSchema = z.object({
    name: z.string().min(2, "Platform name must be at least 2 characters long."),
});

interface LogoGeneratorState {
    logoUrl: string | null;
    error: string | null;
}

export async function generateLogoAction(
    input: z.infer<typeof logoGeneratorSchema>
): Promise<LogoGeneratorState> {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { logoUrl: null, error: "Not authorized." };
    }

    const validatedFields = logoGeneratorSchema.safeParse(input);
    if (!validatedFields.success) {
        return { logoUrl: null, error: "Invalid input." };
    }

    try {
        const result = await generateLogo(validatedFields.data);
        return { logoUrl: result.logoUrl, error: null };
    } catch (error) {
        console.error(error);
        return { logoUrl: null, error: "Failed to generate logo. Please try again." };
    }
}

// --- Course Prerequisites Generator ---
const coursePrereqsSchema = z.object({
  courseTopic: z.string().min(10).max(2000),
});

interface CoursePrereqsState {
  prerequisites: string | null;
  error: { courseTopic?: string[] } | string | null;
}

export async function generateCoursePrerequisitesAction(
  prevState: CoursePrereqsState,
  formData: FormData
): Promise<CoursePrereqsState> {
  const validatedFields = coursePrereqsSchema.safeParse({
    courseTopic: formData.get("courseTopic"),
  });

  if (!validatedFields.success) {
    return { prerequisites: null, error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const result = await generateCoursePrerequisites(validatedFields.data);
    return { prerequisites: result.prerequisites, error: null };
  } catch (error) {
    return { prerequisites: null, error: "Failed to generate prerequisites." };
  }
}

// --- Content Repurposer ---
const contentRepurposeSchema = z.object({
  originalContent: z.string().min(50).max(10000),
  originalFormat: z.string(),
  targetFormats: z.array(z.string()).min(1),
});

interface ContentRepurposeState {
  repurposedIdeas: string | null;
  error: { originalContent?: string[], originalFormat?: string[], targetFormats?: string[] } | string | null;
}

export async function generateContentRepurposeIdeasAction(
  prevState: ContentRepurposeState,
  formData: FormData
): Promise<ContentRepurposeState> {
  const validatedFields = contentRepurposeSchema.safeParse({
    originalContent: formData.get("originalContent"),
    originalFormat: formData.get("originalFormat"),
    targetFormats: formData.getAll("targetFormats"),
  });

  if (!validatedFields.success) {
    return { repurposedIdeas: null, error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const result = await generateContentRepurposeIdeas(validatedFields.data);
    return { repurposedIdeas: result.repurposedIdeas, error: null };
  } catch (error) {
    return { repurposedIdeas: null, error: "Failed to generate ideas." };
  }
}

// --- Ice Breaker Generator ---
const iceBreakerSchema = z.object({
  audience: z.string().min(10).max(1000),
  topic: z.string().min(5).max(500),
  count: z.coerce.number().min(1).max(10),
});

interface IceBreakerState {
  iceBreakers: string | null;
  error: { audience?: string[], topic?: string[], count?: string[] } | string | null;
}

export async function generateIceBreakersAction(
  prevState: IceBreakerState,
  formData: FormData
): Promise<IceBreakerState> {
  const validatedFields = iceBreakerSchema.safeParse({
    audience: formData.get("audience"),
    topic: formData.get("topic"),
    count: formData.get("count"),
  });

  if (!validatedFields.success) {
    return { iceBreakers: null, error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const result = await generateIceBreakers(validatedFields.data);
    return { iceBreakers: result.iceBreakers, error: null };
  } catch (error) {
    return { iceBreakers: null, error: "Failed to generate ice breakers." };
  }
}

// --- Promotional Video Ideas Generator ---
const promoVideoIdeasSchema = z.object({
  courseTopic: z.string().min(10).max(2000),
  targetAudience: z.string().min(10).max(2000),
});

interface PromoVideoIdeasState {
  videoIdeas: string | null;
  error: { courseTopic?: string[], targetAudience?: string[] } | string | null;
}

export async function generatePromoVideoIdeasAction(
  prevState: PromoVideoIdeasState,
  formData: FormData
): Promise<PromoVideoIdeasState> {
  const validatedFields = promoVideoIdeasSchema.safeParse({
    courseTopic: formData.get("courseTopic"),
    targetAudience: formData.get("targetAudience"),
  });

  if (!validatedFields.success) {
    return { videoIdeas: null, error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const result = await generatePromoVideoIdeas(validatedFields.data);
    return { videoIdeas: result.videoIdeas, error: null };
  } catch (error) {
    return { videoIdeas: null, error: "Failed to generate video ideas." };
  }
}
