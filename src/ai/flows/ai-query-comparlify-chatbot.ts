"use server";
/**
 * @fileOverview An AI chatbot for Comparlify that answers user queries and provides personalized recommendations.
 * It uses tools to access the database and can remember conversation history.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import prisma from "@/lib/prisma";
import { Message } from "genkit";
const getPlatformsTool = ai.defineTool(
  {
    name: "getPlatforms",
    description:
      "Get a list of course creation platforms from the database. Use this to answer questions about which platforms are available.",
    inputSchema: z.object({}),
    outputSchema: z.array(z.string()),
  },
  async () => {
    const platforms = await prisma.platform.findMany({
      select: {
        name: true,
      },
    });
    return platforms.map((p) => p.name);
  }
);

const getPlatformDetailsTool = ai.defineTool(
  {
    name: "getPlatformDetails",
    description:
      "Get the details and features for a specific platform. Use this when the user asks for more information about a particular platform, or wants to know if a platform has a certain feature.",
    inputSchema: z.object({
      name: z.string().describe("The name of the platform."),
    }),
    outputSchema: z.object({
      name: z.string(),
      description: z.string(),
      website: z.string(),
      features: z.array(
        z.object({
          name: z.string(),
          hasFeature: z.boolean(),
          details: z.string().nullable(),
        })
      ),
    }),
  },
  async ({ name }) => {
    const platform = await prisma.platform.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      include: {
        features: {
          include: {
            feature: true,
          },
        },
      },
    });

    if (!platform) {
      throw new Error(`Platform ${name} not found.`);
    }

    return {
      name: platform.name,
      description: platform.description,
      website: platform.website,
      features: platform.features.map((f) => ({
        name: f.feature.name,
        hasFeature: f.hasFeature,
        details: f.details,
      })),
    };
  }
);

const HistorySchema = z.array(
  z.object({
    role: z.enum(["user", "model"]),
    content: z.array(z.object({ text: z.string() })),
  })
);

const AIQueryComparlifyChatbotInputSchema = z.object({
  query: z.string().describe("The user query about Comparlify."),
  history: HistorySchema.optional().describe("The conversation history."),
});
export type AIQueryComparlifyChatbotInput = z.infer<
  typeof AIQueryComparlifyChatbotInputSchema
>;

const AIQueryComparlifyChatbotOutputSchema = z.object({
  response: z.string().describe("The chatbot response to the user query."),
});
type AIQueryComparlifyChatbotOutput = z.infer<
  typeof AIQueryComparlifyChatbotOutputSchema
>;

export async function aiQueryComparlifyChatbot(
  input: AIQueryComparlifyChatbotInput
): Promise<AIQueryComparlifyChatbotOutput> {
  return aiQueryComparlifyChatbotFlow(input);
}

const systemPrompt = `You are a helpful and friendly AI assistant for a website called Comparlify.
Your goal is to provide helpful and informative responses to user queries about course creation platforms.
Use the tools provided to access information from the database to answer user questions.
Keep your answers concise and easy to read.
If you provide a link, make sure it is a valid URL.
Do not make up information. If you don't know the answer, say that you don't know.`;

const aiQueryComparlifyChatbotFlow = ai.defineFlow(
  {
    name: "aiQueryComparlifyChatbotFlow",
    inputSchema: AIQueryComparlifyChatbotInputSchema,
    outputSchema: AIQueryComparlifyChatbotOutputSchema,
  },
  async ({ query, history }) => {
    const llmResponse = await ai.generate({
      model: ai.model,
      tools: [getPlatformsTool, getPlatformDetailsTool],
      system: systemPrompt,
      prompt: query,
      history: history as Message[],
    });

    const response = llmResponse.text;
    return { response };
  }
);
