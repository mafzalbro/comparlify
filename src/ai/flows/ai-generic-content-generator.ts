'use server';
/**
 * @fileOverview A versatile AI tool to generate content for various form fields.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenericContentGeneratorInputSchema = z.object({
  fieldType: z.string().describe('The type of content to generate (e.g., "Blog Post Title", "Blog Post Content", "URL Slug").'),
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

const prompt = ai.definePrompt({
  name: 'aiGenericContentGeneratorPrompt',
  input: {schema: AIGenericContentGeneratorInputSchema},
  output: {schema: AIGenericContentGeneratorOutputSchema},
  prompt: `You are an expert content creator and copywriter. Your task is to generate content for a specific field based on a given topic and context.
The generated content should be high-quality, engaging, and written in a natural, human-like voice. Avoid corporate jargon and overly robotic phrasing.

Content to Generate: {{{fieldType}}}
Topic/Title: {{{topic}}}
{{#if context}}
Existing Context:
{{{context}}}
{{/if}}

Please generate the content now.`,
});

const aiGenericContentGeneratorFlow = ai.defineFlow(
  {
    name: 'aiGenericContentGeneratorFlow',
    inputSchema: AIGenericContentGeneratorInputSchema,
    outputSchema: AIGenericContentGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
