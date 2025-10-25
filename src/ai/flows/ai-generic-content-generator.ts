
'use server';
/**
 * @fileOverview A versatile AI tool to generate content for various form fields.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenericContentGeneratorInputSchema = z.object({
  prompt: z.string().describe('The prompt template to guide the AI.'),
  topic: z.string().describe('The main topic or title to base the content on.'),
  context: z.string().optional().describe('Any existing content or context to inform the generation.'),
});
type AIGenericContentGeneratorInput = z.infer<typeof AIGenericContentGeneratorInputSchema>;

const AIGenericContentGeneratorOutputSchema = z.object({
  generatedContent: z.string().describe('The generated content for the specified field.'),
});
type AIGenericContentGeneratorOutput = z.infer<typeof AIGenericContentGeneratorOutputSchema>;

export async function generateGenericContent(input: AIGenericContentGeneratorInput): Promise<AIGenericContentGeneratorOutput> {
  return aiGenericContentGeneratorFlow(input);
}

const aiGenericContentGeneratorFlow = ai.defineFlow(
  {
    name: 'aiGenericContentGeneratorFlow',
    inputSchema: AIGenericContentGeneratorInputSchema,
    outputSchema: AIGenericContentGeneratorOutputSchema,
  },
  async input => {
    // Dynamically create a prompt based on the tool's configuration
    const dynamicPrompt = ai.definePrompt({
      name: 'aiGenericContentGeneratorPrompt',
      input: { schema: AIGenericContentGeneratorInputSchema },
      output: { schema: AIGenericContentGeneratorOutputSchema },
      prompt: input.prompt,
    });

    const {output} = await dynamicPrompt(input);
    return output!;
  }
);
