'use server';
/**
 * @fileOverview A tool to generate ideas for repurposing content.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenerateContentRepurposeInputSchema = z.object({
  originalContent: z.string().describe('The original piece of content (e.g., blog post, video script).'),
  originalFormat: z.string().describe('The original format of the content (e.g., "Blog Post", "Video").'),
  targetFormats: z.array(z.string()).describe('A list of formats to repurpose the content into (e.g., ["Twitter Thread", "LinkedIn Post"]).'),
});
type AIGenerateContentRepurposeInput = z.infer<typeof AIGenerateContentRepurposeInputSchema>;

const AIGenerateContentRepurposeOutputSchema = z.object({
  repurposedIdeas: z.string().describe('A list of actionable ideas for repurposing the content, formatted in Markdown.'),
});
type AIGenerateContentRepurposeOutput = z.infer<typeof AIGenerateContentRepurposeOutputSchema>;

export async function generateContentRepurposeIdeas(input: AIGenerateContentRepurposeInput): Promise<AIGenerateContentRepurposeOutput> {
  return aiContentRepurposerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiContentRepurposerPrompt',
  input: {schema: AIGenerateContentRepurposeInputSchema},
  output: {schema: AIGenerateContentRepurposeOutputSchema},
  prompt: `You are a content marketing strategist. Based on the provided content, generate actionable ideas for repurposing it into new formats.

Original Content Format: {{{originalFormat}}}

Target Formats:
{{#each targetFormats}}
- {{{this}}}
{{/each}}

Original Content:
{{{originalContent}}}

For each target format, provide a specific, actionable idea or a starting draft. Format the entire output in Markdown, with H3 headings for each target format.`,
});

const aiContentRepurposerFlow = ai.defineFlow(
  {
    name: 'aiContentRepurposerFlow',
    inputSchema: AIGenerateContentRepurposeInputSchema,
    outputSchema: AIGenerateContentRepurposeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
