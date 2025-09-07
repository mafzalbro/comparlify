'use server';

/**
 * @fileOverview A tool to generate engaging and effective titles for courses using AI.
 *
 * - generateTitle - A function that generates a course title based on the course description.
 * - AITitleGeneratorInput - The input type for the generateTitle function.
 * - AITitleGeneratorOutput - The return type for the generateTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AITitleGeneratorInputSchema = z.object({
  courseDescription: z
    .string()
    .describe('A detailed description of the course content.'),
});
type AITitleGeneratorInput = z.infer<typeof AITitleGeneratorInputSchema>;

const AITitleGeneratorOutputSchema = z.object({
  courseTitle: z.string().describe('An engaging and effective title for the course.'),
});
type AITitleGeneratorOutput = z.infer<typeof AITitleGeneratorOutputSchema>;

export async function generateTitle(input: AITitleGeneratorInput): Promise<AITitleGeneratorOutput> {
  return aiTitleGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTitleGeneratorPrompt',
  input: {schema: AITitleGeneratorInputSchema},
  output: {schema: AITitleGeneratorOutputSchema},
  prompt: `You are an expert in creating engaging and effective course titles. Based on the provided course description, generate a title that will attract more students and increase enrollment.

Course Description: {{{courseDescription}}}

Title:`,
});

const aiTitleGeneratorFlow = ai.defineFlow(
  {
    name: 'aiTitleGeneratorFlow',
    inputSchema: AITitleGeneratorInputSchema,
    outputSchema: AITitleGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
