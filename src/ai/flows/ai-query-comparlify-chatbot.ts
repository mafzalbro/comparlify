
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
import { getContent } from "@/lib/content";

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


const searchSiteContent = ai.defineTool(
  {
    name: "searchSiteContent",
    description: "Searches the entire website content (blog posts, comparisons, pages) to answer user questions or find relevant links and resources. Use this tool for any queries that go beyond simple platform data.",
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
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    const sitemapXml = await fs.readFile(sitemapPath, 'utf-8');
    const parser = new XMLParser();
    const sitemap = parser.parse(sitemapXml);

    const urls = sitemap.urlset.url.map((u: any) => u.loc);

    const lowerCaseQuery = query.toLowerCase();
    
    const posts = await prisma.post.findMany({
        where: { published: true },
        select: { title: true, slug: true, content: true, description: true }
    });

    const comparisons = await prisma.comparison.findMany({
        where: { published: true },
        select: { title: true, slug: true, summary: true, introduction: true, conclusion: true }
    });

    const siteContent = await prisma.siteContent.findMany();

    const searchCorpus = [
        ...posts.map(p => ({ 
            type: 'blog', 
            id: p.slug, 
            title: p.title, 
            text: `${p.title} ${p.description} ${p.content}`,
            url: `/blog/${p.slug}`
        })),
        ...comparisons.map(c => ({ 
            type: 'compare', 
            id: c.slug, 
            title: c.title, 
            text: `${c.title} ${c.summary} ${c.introduction} ${c.conclusion}`,
            url: `/compare/${c.slug}`
        })),
        ...siteContent.map(sc => ({
            type: 'page',
            id: sc.key,
            title: sc.key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || sc.group,
            text: sc.value,
            url: `/${sc.group.toLowerCase().replace(' page', '')}`
        }))
    ];

    const results: any[] = [];

    searchCorpus.forEach(doc => {
        if (doc.text.toLowerCase().includes(lowerCaseQuery)) {
            const snippetIndex = doc.text.toLowerCase().indexOf(lowerCaseQuery);
            const start = Math.max(0, snippetIndex - 50);
            const end = Math.min(doc.text.length, snippetIndex + 150);
            const snippet = `...${doc.text.substring(start, end)}...`;

            results.push({
                url: doc.url,
                title: doc.title,
                snippet
            });
        }
    });

    // Deduplicate results based on URL
    const uniqueResults = Array.from(new Map(results.map(item => [item['url'], item])).values());

    // Limit to top 3 results
    return uniqueResults.slice(0, 3);
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
    const content = await getContent();
    const siteName = content['global.siteName'] || 'Comparlify';
    const systemPrompt = `You are a helpful and friendly AI assistant for a website called ${siteName}.
Your goal is to provide helpful and informative responses to user queries about course creation platforms and content on the site.
Use the tools provided to access information from the database to answer user questions.
When a user asks for information that might be in a blog post, comparison, or page, use the 'searchSiteContent' tool to find it.
When you find relevant content, summarize the information and provide a direct link to the page in your response.
Format links in Markdown, like this: [Link Text](https://www.comparlify.com/path-to-page).
Keep your answers concise and easy to read.
Do not make up information. If you don't know the answer, say that you don't know.`;

    const llmResponse = await ai.generate({
      model: ai.model,
      tools: [getPlatformsTool, getPlatformDetailsTool, searchSiteContent],
      system: systemPrompt,
      prompt: query,
      history: history as Message[],
    });

    const response = llmResponse.text;
    return { response };
  }
);
