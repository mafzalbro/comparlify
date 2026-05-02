import { ai } from "../src/ai/genkit";
import { BlogPostData } from "../src/blog/types";
import { trendingTopics } from "../src/blog/topics";
import * as fs from "fs";
import * as path from "path";

async function generatePost(topic: { title: string, slug: string, category: string }) {
  console.log(`Generating: ${topic.title}`);

  const prompt = `
    Generate a high-fidelity, industrial-grade blog post in TypeScript format for a creator economy intelligence platform.

    Topic: ${topic.title}
    Slug: ${topic.slug}
    Category: ${topic.category}

    The post must follow the BlogPostData interface:
    interface BlogPostData {
      title: string;
      slug: string;
      description: string;
      content: string; // 1500-2000 words, highly detailed, professional tone, use Markdown headers (##, ###).
      image: string;
      categoryName: string;
      authorEmail: "admin@comparlify.com";
      published: true;
      metaTitle: string;
      metaDescription: string;
      authorRole: string;
      authorBio: string;
      authorCredentials: string;
      keyTakeaways: string[]; // 3 high-impact points
      checklist: { item: string; description: string }[]; // 3 actionable steps
      facts: { title: string; value: string }[]; // 3 industrial data points
      faqs: { question: string; answer: string }[]; // 2 detailed FAQs
      platformNames: string[]; // List of relevant platform names from: Kajabi, Teachable, Skool, Circle, Substack, Beehiiv, HeyGen, Synthesia, Framer, Webflow, Shopify, Ghost, Kit.
    }

    Style Guidelines:
    - Tone: Human, authoritative, industrial, "Intelligence Report" style.
    - Content: Exhaustive analysis, 2026 future-looking trends, data-backed.
    - Structure: Introduction, Part 1, Part 2, Part 3, The "Billion Dollar Question", Conclusion.

    Output ONLY the valid TypeScript code for the object, exported as a constant named after the slug (camelCase).
  `;

  try {
    const { text } = await ai.generate(prompt);
    // Clean the output if it has markdown code blocks
    const code = text.replace(/```typescript|```/g, "").trim();

    const filePath = path.join(process.cwd(), "src/blog/posts", `${topic.slug}.ts`);
    fs.writeFileSync(filePath, code);
    console.log(`Successfully wrote ${topic.slug}.ts`);
  } catch (error) {
    console.error(`Failed to generate ${topic.slug}:`, error);
  }
}

async function main() {
  // Generate 5 at a time to avoid rate limits or timeouts in this session
  const batch = trendingTopics.slice(3, 10);
  for (const topic of batch) {
    await generatePost(topic);
  }
}

main();
