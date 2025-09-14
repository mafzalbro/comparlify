'use server';
/**
 * @fileOverview A tool to generate ice breaker questions.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenerateIceBreakersInputSchema = z.object({
  audience: z.string().describe('A description of the audience (e.g., "web developers", "beginner photographers").'),
  topic: z.string().describe('The central topic or theme of the event/community.'),
  count: z.number().describe('The number of ice breaker questions to generate.'),
});
type AIGenerateIceBreakersInput = z.infer<typeof AIGenerateIceBreakersInputSchema>;

const AIGenerateIceBreakersOutputSchema = z.object({
  iceBreakers: z.string().describe('A list of generated ice breaker questions in Markdown format.'),
});
type AIGenerateIceBreakersOutput = z.infer<typeof AIGenerateIceBreakersOutputSchema>;

export async function generateIceBreakers(input: AIGenerateIceBreakersInput): Promise<AIGenerateIceBreakersOutput> {
  return aiIceBreakerGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiIceBreakerGeneratorPrompt',
  input: {schema: AIGenerateIceBreakersInputSchema},
  output: {schema: AIGenerateIceBreakersOutputSchema},
  prompt: `You are an expert community manager who is great at crafting engaging questions.
Based on the provided audience and topic, generate a list of {{{count}}} ice breaker questions.

The questions should be open-ended, fun, and relevant to the audience and topic.
Format the output as a Markdown list.

Audience: {{{audience}}}
Topic: {{{topic}}}

Ice Breakers:`,
});

const aiIceBreakerGeneratorFlow = ai.defineFlow(
  {
    name: 'aiIceBreakerGeneratorFlow',
    inputSchema: AIGenerateIceBreakersInputSchema,
    outputSchema: AIGenerateIceBreakersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
