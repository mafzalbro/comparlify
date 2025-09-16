'use server';
/**
 * @fileOverview A tool to generate simple analogies for complex topics.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenerateAnalogyInputSchema = z.object({
  complexTopic: z
    .string()
    .describe('The complex topic that needs a simple analogy.'),
  existingContent: z.string().optional().describe('Existing analogy content to continue or expand upon.'),
});
type AIGenerateAnalogyInput = z.infer<typeof AIGenerateAnalogyInputSchema>;

const AIGenerateAnalogyOutputSchema = z.object({
  analogy: z.string().describe('The generated analogy in Markdown format.'),
});
type AIGenerateAnalogyOutput = z.infer<typeof AIGenerateAnalogyOutputSchema>;

export async function generateAnalogy(input: AIGenerateAnalogyInput): Promise<AIGenerateAnalogyOutput> {
  return aiAnalogyGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAnalogyGeneratorPrompt',
  input: {schema: AIGenerateAnalogyInputSchema},
  output: {schema: AIGenerateAnalogyOutputSchema},
  prompt: `You are an expert at explaining complex topics with simple, relatable analogies.
Based on the provided complex topic, create a clear and effective analogy.

Format the output in Markdown.

{{#if existingContent}}
You have already started generating an analogy. Continue where you left off, expanding upon the existing text.
Do not repeat the existing content in your response.

Existing Analogy:
{{{existingContent}}}

Continue From There:
{{else}}
Complex Topic: {{{complexTopic}}}

Analogy:
{{/if}}
`,
});

const aiAnalogyGeneratorFlow = ai.defineFlow(
  {
    name: 'aiAnalogyGeneratorFlow',
    inputSchema: AIGenerateAnalogyInputSchema,
    outputSchema: AIGenerateAnalogyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate analogy from prompt.');
    }
    const finalAnalogy = input.existingContent ? `${input.existingContent}\n${output.analogy}` : output.analogy;
    return { analogy: finalAnalogy };
  }
);
