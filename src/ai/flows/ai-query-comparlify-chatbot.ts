
"use server";
/**
 * @fileOverview An AI chatbot for Comparlify that answers user queries and provides personalized recommendations.
 * It uses tools to access the database and can remember conversation history.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import prisma from "@/lib/prisma";
import { Message } from "genkit";
import { promises as fs } from 'fs';
import path from 'path';
import { XMLParser } from "fast-xml-parser";

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
    return platforms.map((p: { name: string }) => p.name);
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
      features: platform.features.map((f: any) => ({
        name: f.feature.name,
        hasFeature: f.hasFeature,
        details: f.details,
      })),
    };
  }
);


const searchSiteContent = ai.defineTool(
  {
    name: "searchSiteContent",
    description: "Searches the entire website content (blog posts, comparisons, pages) to answer user questions or find relevant links and resources. Use this tool for any queries that go beyond simple platform data, such as asking 'how many' or looking for specific topics.",
    inputSchema: z.object({
      query: z.string().describe("The user's query to search for within the site content."),
    }),
    outputSchema: z.array(z.object({
      url: z.string().describe("The full URL of the relevant page."),
      title: z.string().describe("The title of the page or content."),
      snippet: z.string().describe("A brief, relevant snippet of the content that matches the query."),
    })),
  },
  async ({ query }) => {
    const lowerCaseQuery = query.toLowerCase();

    // Specific word mappings
    const queryWords = lowerCaseQuery.split(/\s+/);
    if (queryWords.includes('courses') || queryWords.includes('course')) {
        // Expand search to include related terms for "courses"
        const searchTerms = ['course', 'platform', 'e-learning', 'lesson', 'teach'];
        const orConditions = searchTerms.map(term => ({
            OR: [
                { title: { contains: term } },
                { description: { contains: term } },
                { content: { contains: term } },
            ]
        }));
        
        const posts = await prisma.post.findMany({
            where: { published: true, AND: { OR: orConditions } },
            select: { title: true, slug: true, description: true }
        });
        
        return posts.map((p: { slug: string; title: string; description: string }) => ({
            url: `/blog/${p.slug}`,
            title: p.title,
            snippet: p.description
        }));
    }

    // Generic search for other queries
    const posts = await prisma.post.findMany({
        where: { published: true, OR: [
            { title: { contains: lowerCaseQuery }},
            { description: { contains: lowerCaseQuery }},
            { content: { contains: lowerCaseQuery }},
        ]},
        select: { title: true, slug: true, description: true }
    });

    const comparisons = await prisma.comparison.findMany({
        where: { published: true, OR: [
            { title: { contains: lowerCaseQuery }},
            { summary: { contains: lowerCaseQuery }},
        ]},
        select: { title: true, slug: true, summary: true }
    });
    
    const results = [
        ...posts.map((p: { slug: string; title: string; description: string }) => ({ url: `/blog/${p.slug}`, title: p.title, snippet: p.description })),
        ...comparisons.map((c: { slug: string; title: string; summary: string }) => ({ url: `/compare/${c.slug}`, title: c.title, snippet: c.summary }))
    ];

    const uniqueResults = Array.from(new Map(results.map((item: any) => [item['url'], item])).values());
    
    return uniqueResults.slice(0, 10); // Return up to 10 results
  }
);


const getTopComparisons = ai.defineTool(
    {
      name: "getTopComparisons",
      description: "Gets the top-rated comparisons from the database. Use this when the user asks for the 'best', 'top', or 'most popular' comparisons.",
      inputSchema: z.object({
        count: z.number().describe("The number of top comparisons to retrieve.").default(3),
      }),
      outputSchema: z.array(z.object({
        title: z.string(),
        url: z.string(),
        averageRating: z.number(),
      })),
    },
    async ({ count }) => {
      const comparisons = await prisma.comparison.findMany({
        where: { published: true },
        include: {
          platformA: true,
          platformB: true,
        },
      });
  
      // Calculate average rating for each comparison and sort
      const ratedComparisons = comparisons.map((c: any) => {
        const ratingA = c.platformA.rating ?? 0;
        const ratingB = c.platformB.rating ?? 0;
        const averageRating = (ratingA + ratingB) / 2;
        return {
          title: c.title,
          url: `/compare/${c.slug}`,
          averageRating,
        };
      }).sort((a: any, b: any) => b.averageRating - a.averageRating);
      
      return ratedComparisons.slice(0, count);
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


const aiQueryComparlifyChatbotFlow = ai.defineFlow(
  {
    name: "aiQueryComparlifyChatbotFlow",
    inputSchema: AIQueryComparlifyChatbotInputSchema,
    outputSchema: AIQueryComparlifyChatbotOutputSchema,
  },
  async ({ query, history }) => {
    const siteName = (await prisma.siteContent.findUnique({ where: { key: "global.siteName" }}))?.value || 'Comparlify';
    const systemPrompt = `You are a helpful and friendly AI assistant for a website called ${siteName}.
Your goal is to provide helpful and informative responses to user queries about course creation platforms and content on the site.

STRICT FORMATTING RULES:
1. PURE HUMAN STYLE: Write in a natural, conversational, yet professional human voice. Avoid robotic or corporate-only jargon.
2. NO LONG PARAGRAPHS: Keep paragraphs very short (max 2-3 sentences). Use whitespace effectively.
3. SCANNABLE STRUCTURE: Use bold headings, bullet points, and lists where appropriate. Ensure your response is easy to skim.
4. DIRECT: Get straight to the point.
5. NO AI CLICHÉS: Avoid typical AI transition phrases.

Use the tools provided to access information from the database to answer user questions.
When a user asks for the "best", "top", or "most popular" comparisons, use the 'getTopComparisons' tool.
For any other questions about site content, such as "how many articles about X" or "do you have a post on Y", use the 'searchSiteContent' tool.
When you use the 'searchSiteContent' tool to answer a "how many" question, you MUST count the number of items returned by the tool and state that number in your response. For example, if the tool returns 3 items for a search on "courses", you should respond with "There are 3 posts related to courses on the site."
When you find relevant content, summarize the information and provide a direct link to the page in your response.
Format links in Markdown, like this: [Link Text](/path-to-page).
If the search tool returns no results, inform the user that you couldn't find anything on that topic.
Keep your answers concise and easy to read.
Do not make up information. If you don't know the answer, say that you don't know.`;

    const llmResponse = await ai.generate({
      tools: [getPlatformsTool, getPlatformDetailsTool, searchSiteContent, getTopComparisons],
      system: systemPrompt,
      prompt: query,
      messages: history as Message[],
    });

    const response = llmResponse.text;
    return { response };
  }
);
