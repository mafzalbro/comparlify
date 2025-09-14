'use server';
/**
 * @fileOverview A tool to generate prerequisites for a course.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIGenerateCoursePrerequisitesInputSchema = z.object({
  courseTopic: z.string().describe('The topic or a brief description of the course.'),
});
type AIGenerateCoursePrerequisitesInput = z.infer<typeof AIGenerateCoursePrerequisitesInputSchema>;

const AIGenerateCoursePrerequisitesOutputSchema = z.object({
  prerequisites: z.string().describe('The generated course prerequisites in Markdown list format.'),
});
type AIGenerateCoursePrerequisitesOutput = z.infer<typeof AIGenerateCoursePrerequisitesOutputSchema>;

export async function generateCoursePrerequisites(input: AIGenerateCoursePrerequisitesInput): Promise<AIGenerateCoursePrerequisitesOutput> {
  return aiCoursePrerequisitesGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCoursePrerequisitesGeneratorPrompt',
  input: {schema: AIGenerateCoursePrerequisitesInputSchema},
  output: {schema: AIGenerateCoursePrerequisitesOutputSchema},
  prompt: `You are an expert curriculum designer. Based on the provided course topic, generate a list of 3-5 recommended prerequisites.

These should include both knowledge-based prerequisites (e.g., "A basic understanding of HTML") and tool-based prerequisites (e.g., "Access to a code editor like VS Code").
Format the output as a Markdown list.

Course Topic: {{{courseTopic}}}

Prerequisites:`,
});

const aiCoursePrerequisitesGeneratorFlow = ai.defineFlow(
  {
    name: 'aiCoursePrerequisitesGeneratorFlow',
    inputSchema: AIGenerateCoursePrerequisitesInputSchema,
    outputSchema: AIGenerateCoursePrerequisitesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
