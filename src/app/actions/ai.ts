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

// --- AI Generic Content Generator ---
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

// Helper for specific AI tools that just wrap generateGenericContentAction
async function generateSpecificContent(prompt: string, topic: string, context?: string) {
  return generateGenericContentAction({ prompt, topic, context });
}

export const generateAnalogyAction = async (input: { topic: string }) =>
  generateSpecificContent("Generate a creative analogy for the following topic.", input.topic);

export const generateAudiencePersonaAction = async (input: { topic: string }) =>
  generateSpecificContent("Create a detailed target audience persona for this niche or product.", input.topic);

export const generateContentRepurposerAction = async (input: { topic: string }) =>
  generateSpecificContent("Repurpose this content for 5 different social media platforms.", input.topic);

export const generateContentRepurposeIdeasAction = generateContentRepurposerAction;

export const generateCourseDescriptionAction = async (input: { topic: string }) =>
  generateSpecificContent("Write a compelling course landing page description.", input.topic);

export const generateCourseOutlineAction = async (input: { topic: string }) =>
  generateSpecificContent("Create a comprehensive 10-module course outline.", input.topic);

export const generateCoursePrerequisitesAction = async (input: { topic: string }) =>
  generateSpecificContent("List the necessary prerequisites and tools needed for this course.", input.topic);

export const generateTitleAction = async (input: { topic: string }) =>
  generateSpecificContent("Generate 10 viral headline ideas for this topic.", input.topic);

export const generateCourseTitleAction = generateTitleAction;

export const generateEmailSubjectLineAction = async (input: { topic: string }) =>
  generateSpecificContent("Write 10 high-open-rate email subject lines.", input.topic);

export const generateEmailSubjectLinesAction = generateEmailSubjectLineAction;

export const generateFAQAction = async (input: { topic: string }) =>
  generateSpecificContent("Generate 10 frequently asked questions and answers for this topic.", input.topic);

export const generateFaqsAction = generateFAQAction;

export const generateIceBreakerAction = async (input: { context: string }) =>
  generateSpecificContent("Create 5 engaging ice breaker questions for a community or workshop.", input.context);

export const generateIceBreakersAction = generateIceBreakerAction;

export const generateLearningObjectivesAction = async (input: { topic: string }) =>
  generateSpecificContent("Define 5 clear learning objectives for this lesson.", input.topic);

export const generateLessonSummaryAction = async (input: { topic: string }) =>
  generateSpecificContent("Write a concise summary for this lesson.", input.topic);

export const generatePromoVideoIdeasAction = async (input: { courseTitle: string }) =>
  generateSpecificContent("Brainstorm 5 promotional video ideas for this product.", input.courseTitle);

export const generateVideoIdeasAction = generatePromoVideoIdeasAction;

export const generateQuizAction = async (input: { topic: string }) =>
  generateSpecificContent("Create a 5-question multiple choice quiz with an answer key.", input.topic);

export const generateSocialMediaPostAction = async (input: { topic: string }) =>
  generateSpecificContent("Write an engaging social media post for LinkedIn, Twitter, and Instagram.", input.topic);

export const generateVideoScriptAction = async (input: { topic: string }) =>
  generateSpecificContent("Write a detailed video script with intro, hook, main points, and outro.", input.topic);

export async function generateIntelligenceReportAction(input: {
  platformAName: string;
  platformBName: string;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { generatedContent: null, error: "Not authorized." };
  }

  const prompt = `
    Generate a HIGH-FIDELITY, 3,000-word industrial deep-dive comparison between ${input.platformAName} and ${input.platformBName}.

    STRUCTURE:
    1. THE BILLION DOLLAR QUESTION: A high-stakes hook.
    2. ARCHITECTURE & SCALABILITY: Technical breakdown.
    3. MONETIZATION STRATEGY: Transaction fees, pricing tiers, and hidden costs.
    4. THE 2026 AI ADVANTAGE: Future-proofing analysis.
    5. SCENARIO-BASED VERDICT: Who wins for Coaches vs. SaaS vs. Course Creators.

    STYLE: Use the HUMAN_STYLE_PROMPT guidelines. Be ruthless, objective, and data-driven.
  `;

  return generateGenericContentAction({
    prompt,
    topic: `${input.platformAName} vs ${input.platformBName}`,
  });
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
