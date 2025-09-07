'use server';
/**
 * @fileOverview A tool to generate Frequently Asked Questions (FAQs).
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenerateFaqsInputSchema = z.object({
  topicContent: z
    .string()
    .describe('A block of text about the course, lesson, or topic.'),
});
type AIGenerateFaqsInput = z.infer<typeof AIGenerateFaqsInputSchema>;

const AIGenerateFaqsOutputSchema = z.object({
  faqs: z.string().describe('A list of generated FAQs in Markdown format.'),
});
type AIGenerateFaqsOutput = z.infer<typeof AIGenerateFaqsOutputSchema>;

export async function generateFaqs(input: AIGenerateFaqsInput): Promise<AIGenerateFaqsOutput> {
  return aiFaqGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiFaqGeneratorPrompt',
  input: {schema: AIGenerateFaqsInputSchema},
  output: {schema: AIGenerateFaqsOutputSchema},
  prompt: `You are an expert curriculum designer. Based on the provided content, generate a list of 5-7 frequently asked questions (FAQs) and their answers.

The questions should anticipate what a student might be curious or confused about.
The answers should be clear and concise.
Format the output in Markdown, with questions as H3 headings and answers as paragraphs below them.

Content: {{{topicContent}}}

FAQs:`,
});

const aiFaqGeneratorFlow = ai.defineFlow(
  {
    name: 'aiFaqGeneratorFlow',
    inputSchema: AIGenerateFaqsInputSchema,
    outputSchema: AIGenerateFaqsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
