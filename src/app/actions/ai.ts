"use server";

import { z } from "zod";
import {
  aiQueryComparlifyChatbot,
  type AIQueryComparlifyChatbotInput,
} from "@/ai/flows/ai-query-comparlify-chatbot";
import { generateGenericContent } from "@/ai/flows/ai-generic-content-generator";
import { generateImage } from "@/ai/flows/ai-image-generator";
import { generateLogo } from "@/ai/flows/ai-logo-generator";
import { auth } from "@/lib/auth";

const HUMAN_STYLE_PROMPT = `
STRICT FORMATTING RULES:
1. PURE HUMAN STYLE: Write in a natural, conversational, yet professional human voice. Avoid robotic or corporate-only jargon.
2. NO LONG PARAGRAPHS: Keep paragraphs very short (max 2-3 sentences). Use whitespace effectively.
3. SCANNABLE STRUCTURE: Use bold headings, bullet points, and lists. Ensure the content is easy to skim.
4. NATURAL RHYTHM: Vary sentence length.
5. NO AI CLICHÉS: Avoid typical AI transition phrases like "In conclusion," "Moreover," or "Furthermore."
`;

export interface AIActionState {
  generatedContent: string | null;
  error: string | null | any;
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

// --- AI Generic Content Generator (Internal helper for general prompts) ---
const genericContentSchema = z.object({
  prompt: z.string().min(1, "Prompt template is required."),
  topic: z.string().min(1, "Topic is required."),
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
  if (!session?.user) {
    return { generatedContent: null, error: "Not authorized." };
  }

  const validatedFields = genericContentSchema.safeParse(input);
  if (!validatedFields.success) {
    return { 
      generatedContent: null, 
      error: validatedFields.error.errors[0]?.message || "Invalid input." 
    };
  }

  try {
    const enhancedPrompt = `${validatedFields.data.prompt}\n\n${HUMAN_STYLE_PROMPT}`;
    const result = await generateGenericContent({
      ...validatedFields.data,
      prompt: enhancedPrompt,
    });
    return { generatedContent: result.generatedContent, error: null };
  } catch (error) {
    console.error(error);
    return {
      generatedContent: null,
      error: "Failed to generate content. Please try again.",
    };
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
  if (session?.user?.role !== "ADMIN") {
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
    return {
      imageUrl: null,
      error: "Failed to generate image. Please try again.",
    };
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
  if (session?.user?.role !== "ADMIN") {
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
    return {
      logoUrl: null,
      error: "Failed to generate logo. Please try again.",
    };
  }
}

// --- Analogy Generator ---
export interface AnalogyState extends AIActionState {}
export async function generateAnalogyAction(
  _prevState: AnalogyState,
  formData: FormData
): Promise<AnalogyState> {
  const session = await auth();
  if (!session?.user) return { generatedContent: null, error: "Not authorized." };

  const complexTopic = formData.get("complexTopic") as string;
  const existingContent = formData.get("existingContent") as string;

  if (!complexTopic) return { generatedContent: null, error: "Complex topic is required." };

  try {
    const result = await generateGenericContent({
      prompt: "Generate a clear and relatable analogy to explain the following complex topic. Make it easy to understand for beginners.",
      topic: complexTopic,
      context: existingContent || undefined,
    });
    return { generatedContent: result.generatedContent, error: null };
  } catch (error) {
    console.error(error);
    return { generatedContent: null, error: "Failed to generate analogy. Please try again." };
  }
}

// --- Audience Persona Generator ---
export interface AudiencePersonaState extends AIActionState {}
export async function generateAudiencePersonaAction(
  _prevState: AudiencePersonaState,
  formData: FormData
): Promise<AudiencePersonaState> {
  const session = await auth();
  if (!session?.user) return { generatedContent: null, error: "Not authorized." };

  const courseTitle = formData.get("courseTitle") as string;
  const existingContent = formData.get("existingContent") as string;

  if (!courseTitle) return { generatedContent: null, error: "Course title is required." };

  try {
    const result = await generateGenericContent({
      prompt: "Create a detailed audience persona for the following course. Include demographics, goals, pain points, and learning preferences.",
      topic: courseTitle,
      context: existingContent || undefined,
    });
    return { generatedContent: result.generatedContent, error: null };
  } catch (error) {
    console.error(error);
    return { generatedContent: null, error: "Failed to generate audience persona. Please try again." };
  }
}

// --- Content Repurposer ---
export interface ContentRepurposeState extends AIActionState {}
export async function generateContentRepurposeIdeasAction(
  _prevState: ContentRepurposeState,
  formData: FormData
): Promise<ContentRepurposeState> {
  const session = await auth();
  if (!session?.user) return { generatedContent: null, error: "Not authorized." };

  const originalContent = formData.get("originalContent") as string;
  const existingContent = formData.get("existingContent") as string;

  if (!originalContent) return { generatedContent: null, error: "Original content is required." };

  try {
    const result = await generateGenericContent({
      prompt: "Generate creative ideas for repurposing the following content into different formats (e.g., blog posts, social media, infographics, videos, podcasts).",
      topic: originalContent,
      context: existingContent || undefined,
    });
    return { generatedContent: result.generatedContent, error: null };
  } catch (error) {
    console.error(error);
    return { generatedContent: null, error: "Failed to generate repurpose ideas. Please try again." };
  }
}

// --- Course Description Writer ---
export interface CourseDescriptionState extends AIActionState {}
export async function generateCourseDescriptionAction(
  _prevState: CourseDescriptionState,
  formData: FormData
): Promise<CourseDescriptionState> {
  const session = await auth();
  if (!session?.user) return { generatedContent: null, error: "Not authorized." };

  const courseTitle = formData.get("courseTitle") as string;
  const existingContent = formData.get("existingContent") as string;

  if (!courseTitle) return { generatedContent: null, error: "Course title is required." };

  try {
    const result = await generateGenericContent({
      prompt: "Write a compelling course description that highlights key benefits, target audience, and what students will learn. Make it engaging and professional.",
      topic: courseTitle,
      context: existingContent || undefined,
    });
    return { generatedContent: result.generatedContent, error: null };
  } catch (error) {
    console.error(error);
    return { generatedContent: null, error: "Failed to generate course description. Please try again." };
  }
}

// --- Course Outliner ---
export interface CourseOutlineState extends AIActionState {}
export async function generateCourseOutlineAction(
  _prevState: CourseOutlineState,
  formData: FormData
): Promise<CourseOutlineState> {
  const session = await auth();
  if (!session?.user) return { generatedContent: null, error: "Not authorized." };

  const courseTitle = formData.get("courseTitle") as string;
  const existingContent = formData.get("existingContent") as string;

  if (!courseTitle) return { generatedContent: null, error: "Course title is required." };

  try {
    const result = await generateGenericContent({
      prompt: "Create a comprehensive course outline with modules, lessons, and topics. Structure it logically from beginner to advanced concepts.",
      topic: courseTitle,
      context: existingContent || undefined,
    });
    return { generatedContent: result.generatedContent, error: null };
  } catch (error) {
    console.error(error);
    return { generatedContent: null, error: "Failed to generate course outline. Please try again." };
  }
}

// --- Course Prerequisites ---
export interface CoursePrerequisitesState extends AIActionState {}
export async function generateCoursePrerequisitesAction(
  _prevState: CoursePrerequisitesState,
  formData: FormData
): Promise<CoursePrerequisitesState> {
  const session = await auth();
  if (!session?.user) return { generatedContent: null, error: "Not authorized." };

  const courseTitle = formData.get("courseTitle") as string;
  const existingContent = formData.get("existingContent") as string;

  if (!courseTitle) return { generatedContent: null, error: "Course title is required." };

  try {
    const result = await generateGenericContent({
      prompt: "List the prerequisites and required knowledge for this course. Include technical skills, prior knowledge, and any tools or software needed.",
      topic: courseTitle,
      context: existingContent || undefined,
    });
    return { generatedContent: result.generatedContent, error: null };
  } catch (error) {
    console.error(error);
    return { generatedContent: null, error: "Failed to generate prerequisites. Please try again." };
  }
}

// --- Email Subject Line Generator ---
export interface EmailSubjectLinesState extends AIActionState {}
export async function generateEmailSubjectLinesAction(
  _prevState: EmailSubjectLinesState,
  formData: FormData
): Promise<EmailSubjectLinesState> {
  const session = await auth();
  if (!session?.user) return { generatedContent: null, error: "Not authorized." };

  const emailTopic = formData.get("emailTopic") as string;
  const existingContent = formData.get("existingContent") as string;

  if (!emailTopic) return { generatedContent: null, error: "Email topic is required." };

  try {
    const result = await generateGenericContent({
      prompt: "Generate 10 compelling email subject lines for the following topic. Make them attention-grabbing, concise, and optimized for open rates.",
      topic: emailTopic,
      context: existingContent || undefined,
    });
    return { generatedContent: result.generatedContent, error: null };
  } catch (error) {
    console.error(error);
    return { generatedContent: null, error: "Failed to generate subject lines. Please try again." };
  }
}

// --- FAQ Generator ---
export interface FaqState extends AIActionState {}
export async function generateFaqsAction(
  _prevState: FaqState,
  formData: FormData
): Promise<FaqState> {
  const session = await auth();
  if (!session?.user) return { generatedContent: null, error: "Not authorized." };

  const topic = formData.get("topic") as string;
  const existingContent = formData.get("existingContent") as string;

  if (!topic) return { generatedContent: null, error: "Topic is required." };

  try {
    const result = await generateGenericContent({
      prompt: "Generate a comprehensive list of frequently asked questions (FAQs) with detailed answers for the following topic.",
      topic: topic,
      context: existingContent || undefined,
    });
    return { generatedContent: result.generatedContent, error: null };
  } catch (error) {
    console.error(error);
    return { generatedContent: null, error: "Failed to generate FAQs. Please try again." };
  }
}

// --- Ice Breaker Generator ---
export interface IceBreakersState extends AIActionState {}
export async function generateIceBreakersAction(
  _prevState: IceBreakersState,
  formData: FormData
): Promise<IceBreakersState> {
  const session = await auth();
  if (!session?.user) return { generatedContent: null, error: "Not authorized." };

  const context = formData.get("context") as string;
  const existingContent = formData.get("existingContent") as string;

  if (!context) return { generatedContent: null, error: "Context is required." };

  try {
    const result = await generateGenericContent({
      prompt: "Generate creative and engaging ice breaker activities or questions for the following context. Make them fun and inclusive.",
      topic: context,
      context: existingContent || undefined,
    });
    return { generatedContent: result.generatedContent, error: null };
  } catch (error) {
    console.error(error);
    return { generatedContent: null, error: "Failed to generate ice breakers. Please try again." };
  }
}

// --- Learning Objectives Generator ---
export interface LearningObjectivesState extends AIActionState {}
export async function generateLearningObjectivesAction(
  _prevState: LearningObjectivesState,
  formData: FormData
): Promise<LearningObjectivesState> {
  const session = await auth();
  if (!session?.user) return { generatedContent: null, error: "Not authorized." };

  const lessonTopic = formData.get("lessonTopic") as string;
  const existingContent = formData.get("existingContent") as string;

  if (!lessonTopic) return { generatedContent: null, error: "Lesson topic is required." };

  try {
    const result = await generateGenericContent({
      prompt: "Create clear, measurable learning objectives using Bloom's Taxonomy for the following lesson topic. Use action verbs and be specific.",
      topic: lessonTopic,
      context: existingContent || undefined,
    });
    return { generatedContent: result.generatedContent, error: null };
  } catch (error) {
    console.error(error);
    return { generatedContent: null, error: "Failed to generate learning objectives. Please try again." };
  }
}

// --- Lesson Summarizer ---
export interface LessonSummaryState extends AIActionState {}
export async function generateLessonSummaryAction(
  _prevState: LessonSummaryState,
  formData: FormData
): Promise<LessonSummaryState> {
  const session = await auth();
  if (!session?.user) return { generatedContent: null, error: "Not authorized." };

  const lessonContent = formData.get("lessonContent") as string;
  const existingContent = formData.get("existingContent") as string;

  if (!lessonContent) return { generatedContent: null, error: "Lesson content is required." };

  try {
    const result = await generateGenericContent({
      prompt: "Summarize the following lesson content into key points and takeaways. Make it concise and easy to review.",
      topic: lessonContent,
      context: existingContent || undefined,
    });
    return { generatedContent: result.generatedContent, error: null };
  } catch (error) {
    console.error(error);
    return { generatedContent: null, error: "Failed to generate lesson summary. Please try again." };
  }
}

// --- Promo Video Ideas Generator ---
export interface PromoVideoIdeasState extends AIActionState {}
export async function generatePromoVideoIdeasAction(
  _prevState: PromoVideoIdeasState,
  formData: FormData
): Promise<PromoVideoIdeasState> {
  const session = await auth();
  if (!session?.user) return { generatedContent: null, error: "Not authorized." };

  const courseTitle = formData.get("courseTitle") as string;
  const existingContent = formData.get("existingContent") as string;

  if (!courseTitle) return { generatedContent: null, error: "Course title is required." };

  try {
    const result = await generateGenericContent({
      prompt: "Generate creative promotional video ideas and concepts for the following course. Include hooks, key messages, and visual suggestions.",
      topic: courseTitle,
      context: existingContent || undefined,
    });
    return { generatedContent: result.generatedContent, error: null };
  } catch (error) {
    console.error(error);
    return { generatedContent: null, error: "Failed to generate promo video ideas. Please try again." };
  }
}

// --- Quiz Generator ---
export interface QuizState extends AIActionState {}
export async function generateQuizAction(
  _prevState: QuizState,
  formData: FormData
): Promise<QuizState> {
  const session = await auth();
  if (!session?.user) return { generatedContent: null, error: "Not authorized." };

  const topic = formData.get("topic") as string;
  const existingContent = formData.get("existingContent") as string;

  if (!topic) return { generatedContent: null, error: "Topic is required." };

  try {
    const result = await generateGenericContent({
      prompt: "Create a comprehensive quiz with multiple-choice questions, including correct answers and explanations for the following topic.",
      topic: topic,
      context: existingContent || undefined,
    });
    return { generatedContent: result.generatedContent, error: null };
  } catch (error) {
    console.error(error);
    return { generatedContent: null, error: "Failed to generate quiz. Please try again." };
  }
}

// --- Social Media Post Generator ---
export interface SocialMediaPostState extends AIActionState {}
export async function generateSocialMediaPostAction(
  _prevState: SocialMediaPostState,
  formData: FormData
): Promise<SocialMediaPostState> {
  const session = await auth();
  if (!session?.user) return { generatedContent: null, error: "Not authorized." };

  const topic = formData.get("topic") as string;
  const platform = formData.get("platform") as string;
  const existingContent = formData.get("existingContent") as string;

  if (!topic) return { generatedContent: null, error: "Topic is required." };

  try {
    const result = await generateGenericContent({
      prompt: `Create an engaging social media post for ${platform || "social media"} about the following topic. Include hashtags and a call-to-action.`,
      topic: topic,
      context: existingContent || undefined,
    });
    return { generatedContent: result.generatedContent, error: null };
  } catch (error) {
    console.error(error);
    return { generatedContent: null, error: "Failed to generate social media post. Please try again." };
  }
}

// --- Course Title Generator ---
export interface CourseTitleState extends AIActionState {}
export async function generateCourseTitleAction(
  _prevState: CourseTitleState,
  formData: FormData
): Promise<CourseTitleState> {
  const session = await auth();
  if (!session?.user) return { generatedContent: null, error: "Not authorized." };

  const courseDescription = formData.get("courseDescription") as string;
  const existingContent = formData.get("existingContent") as string;

  if (!courseDescription) return { generatedContent: null, error: "Course description is required." };

  try {
    const result = await generateGenericContent({
      prompt: "Generate 10 catchy, SEO-friendly course titles based on the following description. Make them compelling and clear.",
      topic: courseDescription,
      context: existingContent || undefined,
    });
    return { generatedContent: result.generatedContent, error: null };
  } catch (error) {
    console.error(error);
    return { generatedContent: null, error: "Failed to generate course titles. Please try again." };
  }
}

// --- Video Scripter ---
export interface VideoScriptState extends AIActionState {}
export async function generateVideoScriptAction(
  _prevState: VideoScriptState,
  formData: FormData
): Promise<VideoScriptState> {
  const session = await auth();
  if (!session?.user) return { generatedContent: null, error: "Not authorized." };

  const topic = formData.get("topic") as string;
  const existingContent = formData.get("existingContent") as string;

  if (!topic) return { generatedContent: null, error: "Topic is required." };

  try {
    const result = await generateGenericContent({
      prompt: "Write a detailed video script for the following topic. Include an engaging introduction, main content with clear explanations, and a strong conclusion with a call-to-action.",
      topic: topic,
      context: existingContent || undefined,
    });
    return { generatedContent: result.generatedContent, error: null };
  } catch (error) {
    console.error(error);
    return { generatedContent: null, error: "Failed to generate video script. Please try again." };
  }
}

// --- Workflow Structurer ---
export async function structureWorkflowAction(content: string) {
  const session = await auth();
  if (!session?.user) return { branches: [], error: "Not authorized." };

  try {
    const result = await generateGenericContent({
      prompt: "Transform the provided markdown content into a highly structured branching workflow JSON. Analyze the content and break it down into high-level 'branches' (logical sections/paths). Each branch should have a title and a list of 'nodes' (steps/details). Each node must have a title and content (full markdown for details). Output ONLY raw JSON in this format: { \"branches\": [ { \"title\": \"...\", \"nodes\": [ { \"title\": \"...\", \"content\": \"...\" } ] } ] }",
      topic: "Workflow Structuring",
      context: content,
    });
    
    const cleanJson = result.generatedContent.replace(/```json|```/g, "").trim();
    // Safety check for common AI JSON prefixes
    const jsonStart = cleanJson.indexOf("{");
    const jsonEnd = cleanJson.lastIndexOf("}");
    const finalJson = cleanJson.substring(jsonStart, jsonEnd + 1);

    const parsed = JSON.parse(finalJson);
    return { branches: parsed.branches || [], error: null };
  } catch (error) {
    console.error("Workflow Structuring Error:", error);
    return { branches: [], error: "Failed to structure workflow." };
  }
}
