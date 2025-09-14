'use server';
/**
 * @fileOverview A tool to generate ideas for a promotional video.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGeneratePromoVideoIdeasInputSchema = z.object({
  courseTopic: z.string().describe('The main topic of the course.'),
  targetAudience: z.string().describe('A description of the target audience for the course.'),
});
type AIGeneratePromoVideoIdeasInput = z.infer<typeof AIGeneratePromoVideoIdeasInputSchema>;

const AIGeneratePromoVideoIdeasOutputSchema = z.object({
  videoIdeas: z.string().describe('A list of 3-5 promotional video ideas in Markdown format.'),
});
type AIGeneratePromoVideoIdeasOutput = z.infer<typeof AIGeneratePromoVideoIdeasOutputSchema>;

export async function generatePromoVideoIdeas(input: AIGeneratePromoVideoIdeasInput): Promise<AIGeneratePromoVideoIdeasOutput> {
  return aiPromoVideoIdeasGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPromoVideoIdeasGeneratorPrompt',
  input: {schema: AIGeneratePromoVideoIdeasInputSchema},
  output: {schema: AIGeneratePromoVideoIdeasOutputSchema},
  prompt: `You are an expert video marketing strategist.
Based on the provided course topic and target audience, generate a list of 3-5 creative and compelling ideas for a short promotional video (e.g., for YouTube Shorts, Instagram Reels, TikTok).

For each idea, provide:
- A catchy title/hook.
- A brief concept description.
- A suggestion for the style (e.g., talking head, quick cuts, screen recording).

Format the output in Markdown, with each idea as a main bullet point.

Course Topic: {{{courseTopic}}}
Target Audience: {{{targetAudience}}}

Promotional Video Ideas:`,
});

const aiPromoVideoIdeasGeneratorFlow = ai.defineFlow(
  {
    name: 'aiPromoVideoIdeasGeneratorFlow',
    inputSchema: AIGeneratePromoVideoIdeasInputSchema,
    outputSchema: AIGeneratePromoVideoIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
