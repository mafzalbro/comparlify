'use server';

/**
 * @fileOverview A tool to generate a detailed course outline using AI.
 *
 * - generateCourseOutline - A function that generates a course outline based on a description.
 * - AIGenerateCourseOutlineInput - The input type for the generateCourseOutline function.
 * - AIGenerateCourseOutlineOutput - The return type for the generateCourseOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenerateCourseOutlineInputSchema = z.object({
  courseDescription: z
    .string()
    .describe('A detailed description of the course content.'),
  existingContent: z.string().optional().describe('Existing outline content to continue or expand upon.'),
});
export type AIGenerateCourseOutlineInput = z.infer<typeof AIGenerateCourseOutlineInputSchema>;

const AIGenerateCourseOutlineOutputSchema = z.object({
  courseOutline: z.string().describe('The generated course outline in Markdown format.'),
});
type AIGenerateCourseOutlineOutput = z.infer<typeof AIGenerateCourseOutlineOutputSchema>;

export async function generateCourseOutline(input: AIGenerateCourseOutlineInput): Promise<AIGenerateCourseOutlineOutput> {
  return aiCourseOutlinerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCourseOutlinerPrompt',
  input: {schema: AIGenerateCourseOutlineInputSchema},
  output: {schema: AIGenerateCourseOutlineOutputSchema},
  prompt: `You are an expert curriculum designer.
{{#if existingContent}}
You have already started generating a course outline. Continue where you left off, adding more modules or lessons.
Do not repeat the existing content in your response. Make sure the new content flows naturally from the existing outline.

Existing Outline:
{{{existingContent}}}

Continue From There:
{{else}}
Based on the provided course description, create a comprehensive and well-structured course outline.

The outline should be formatted in Markdown.
Use headings for modules and nested lists for lessons within each module.
Each lesson should have a brief, one-sentence description.

Course Description: {{{courseDescription}}}

Outline:
{{/if}}
`,
});

const aiCourseOutlinerFlow = ai.defineFlow(
  {
    name: 'aiCourseOutlinerFlow',
    inputSchema: AIGenerateCourseOutlineInputSchema,
    outputSchema: AIGenerateCourseOutlineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    const finalOutline = input.existingContent ? `${input.existingContent}\n${output!.courseOutline}` : output!.courseOutline;
    return { courseOutline: finalOutline };
  }
);
